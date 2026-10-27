import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import {
  buildClientSchema,
  buildSchema,
  getIntrospectionQuery,
  printSchema,
} from 'graphql';
import request from 'supertest';
import type { Server } from 'node:http';
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { AppModule } from '../src/app.module.js';
import {
  createDatabaseClient,
  type DatabaseClient,
} from '../src/database/client.js';
import { DatabaseService } from '../src/database/database.service.js';
import { seedProfile } from '../src/database/seed-profile.js';
import { profileData } from '../src/database/profile.data.js';
import { ProfileRepository } from '../src/profile/profile.repository.js';
import { configureHttp } from '../src/config/configure-http.js';
import { readEnvironment } from '../src/config/environment.js';
import { DEMO_QUERY } from '../src/graphql/demo-query.js';

const REQUIRED_QUERY =
  '{ profile { name description skills { name } experience { company position } projects { name } } }';
const PROJECT_QUERY = '{ profile { projects { name skills { name } } } }';
interface GraphQLBody {
  data?: {
    profile: {
      name: string;
      projects: { name: string; url: string; skills: { name: string }[] }[];
      experience: { company: string; endMonth: string | null }[];
      links: { url: string }[];
      skills: { name: string }[];
    };
  };
  errors?: {
    message: string;
    extensions: { code: string; stacktrace?: unknown };
  }[];
}

describe('business card against PostgreSQL', () => {
  let app: INestApplication;
  let server: Server;
  let client: DatabaseClient;
  let admin: DatabaseClient;
  const schemaName = `card_test_${randomUUID().replaceAll('-', '')}`;
  const previousEnvironment = { ...process.env };
  const queries: string[] = [];
  const metrics: Record<string, number> = {};

  beforeAll(async () => {
    const testUrl = process.env.TEST_DATABASE_URL;
    if (!testUrl || !new URL(testUrl).pathname.endsWith('_test')) {
      throw new Error(
        'Set TEST_DATABASE_URL to a dedicated PostgreSQL database whose name ends in _test.',
      );
    }
    admin = createDatabaseClient(testUrl);
    // Generated identifier only. Never interpolate user input into raw SQL.
    await admin.$executeRawUnsafe(`CREATE SCHEMA "${schemaName}"`);
    const isolatedUrl = new URL(testUrl);
    isolatedUrl.searchParams.set('schema', schemaName);
    process.env.DATABASE_URL = isolatedUrl.href;
    process.env.NODE_ENV = 'production';
    process.env.DEMO_SANDBOX = 'true';
    process.env.LOG_LEVEL = 'silent';
    process.env.RATE_LIMIT_MAX = '10000';
    execFileSync(
      process.execPath,
      [
        fileURLToPath(
          new URL('../node_modules/prisma/build/index.js', import.meta.url),
        ),
        'migrate',
        'deploy',
      ],
      {
        env: process.env,
        stdio: 'pipe',
      },
    );
    const fixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = fixture.createNestApplication({ bodyParser: false, logger: false });
    configureHttp(app, readEnvironment());
    await app.init();
    server = app.getHttpServer() as Server;
    client = app.get(DatabaseService).client;
    client.$on('query', (event) => {
      if (/^SELECT\b/i.test(event.query)) queries.push(event.query);
    });
    await seedProfile(client, profileData);
  });

  beforeEach(async () => {
    await seedProfile(client, profileData);
    queries.length = 0;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  afterAll(async () => {
    if (Object.keys(metrics).length) {
      console.info('Measured SQL SELECT statements:', metrics);
      mkdirSync('coverage', { recursive: true });
      writeFileSync(
        'coverage/query-counts.json',
        `${JSON.stringify(metrics, null, 2)}\n`,
      );
    }
    await app?.close();
    if (admin) {
      await admin.$executeRawUnsafe(
        `DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`,
      );
      await admin.$disconnect();
    }
    process.env = previousEnvironment;
  });

  const query = (source: string) =>
    request(server).post('/graphql').send({ query: source });

  it('executes the exact query from the specification', async () => {
    const response = await query(REQUIRED_QUERY).expect(200);
    const body = response.body as GraphQLBody;
    expect(body.errors).toBeUndefined();
    expect(body.data?.profile.name).toBe(profileData.name);
    expect(body.data?.profile.projects.map((project) => project.name)).toEqual([
      'VayVnd',
      'LendSwap',
      'Lendao',
    ]);
    expect(body.data?.profile.experience.map((item) => item.company)).toEqual(
      profileData.experience.map((item) => item.company),
    );
  });

  it('serves the documented complete profile including real links and current employment', async () => {
    const response = await query(DEMO_QUERY).expect(200);
    const body = response.body as GraphQLBody;
    expect(body.errors).toBeUndefined();
    expect(
      body.data?.profile.projects.every((project) =>
        project.url.startsWith('https://'),
      ),
    ).toBe(true);
    expect(body.data?.profile.experience[0]?.endMonth).toBeNull();
    expect(body.data?.profile.links).toContainEqual(
      expect.objectContaining({ url: 'https://github.com/wassupOG' }),
    );
    metrics.fullProfile = queries.length;
  });

  it('reads only Profile for a scalar-only query', async () => {
    await query('{ profile { name } }').expect(200);
    expect(queries).toHaveLength(1);
    expect(queries[0]).toContain('"Profile"');
    expect(queries.join(' ')).not.toMatch(
      /"(Skill|Experience|Project|ProfileLink)"/,
    );
    metrics.scalarProfile = queries.length;
  });

  it('batches nested project skills: SELECT count is unchanged for 3 versus 33 projects', async () => {
    await query(PROJECT_QUERY).expect(200);
    const baseline = queries.length;
    expect(baseline).toBeLessThanOrEqual(4);
    const project = profileData.projects[0]!;
    for (let index = 0; index < 30; index++) {
      await client.project.create({
        data: {
          id: `fixture-${index}`,
          profileId: profileData.id,
          name: `Fixture ${index}`,
          description: project.description,
          contribution: project.contribution,
          url: project.url,
          sortOrder: index + 10,
          skills: { create: project.skillIds.map((skillId) => ({ skillId })) },
        },
      });
    }
    queries.length = 0;
    const response = await query(PROJECT_QUERY).expect(200);
    const body = response.body as GraphQLBody;
    expect(body.errors).toBeUndefined();
    expect(body.data?.profile.projects).toHaveLength(33);
    expect(
      body.data?.profile.projects.every((item) => item.skills.length > 0),
    ).toBe(true);
    expect(queries).toHaveLength(baseline);
    metrics.projects3 = baseline;
    metrics.projects33 = queries.length;
  });

  it('reuses loads for aliases within an operation', async () => {
    await query(PROJECT_QUERY).expect(200);
    const baseline = queries.length;
    queries.length = 0;
    const response = await query(
      `{ first: profile { projects { skills { name } } } second: profile { projects { skills { name } } } }`,
    ).expect(200);
    expect(response.body.errors).toBeUndefined();
    expect(queries).toHaveLength(baseline);
  });

  it('does not share a loader cache between operations', async () => {
    await query('{ profile { name } }').expect(200);
    await client.profile.update({
      where: { id: profileData.id },
      data: { name: 'Changed between requests' },
    });
    const response = await query('{ profile { name } }').expect(200);
    expect(response.body.data.profile.name).toBe('Changed between requests');
  });

  it('returns [] for projects without associated skills', async () => {
    await client.projectSkill.deleteMany({ where: { projectId: 'vayvnd' } });
    const response = await query(PROJECT_QUERY).expect(200);
    expect(response.body.data.profile.projects[0].skills).toEqual([]);
  });

  it('keeps repeat seeding idempotent and preserves unrelated profiles', async () => {
    await client.profile.create({
      data: {
        id: 'unrelated',
        name: 'Other profile',
        headline: 'Other',
        description: 'Unmanaged',
      },
    });
    await seedProfile(client, profileData);
    await seedProfile(client, profileData);
    expect(await client.project.count()).toBe(profileData.projects.length);
    expect(await client.skill.count()).toBe(profileData.skills.length);
    expect(await client.projectSkill.count()).toBe(
      profileData.projects.reduce(
        (sum, project) => sum + project.skillIds.length,
        0,
      ),
    );
    expect(
      await client.profile.findUnique({ where: { id: 'unrelated' } }),
    ).not.toBeNull();
  });

  it('converges updated fields and removed skills, projects and links', async () => {
    const changed = structuredClone(profileData);
    changed.description = 'Updated profile';
    changed.projects = [changed.projects[0]!];
    changed.projects[0]!.skillIds = ['typescript'];
    changed.skills = changed.skills.filter(
      (skill) => skill.id !== 'playwright',
    );
    changed.links = [changed.links[0]!];
    await seedProfile(client, changed);
    expect(
      (
        await client.profile.findUniqueOrThrow({
          where: { id: profileData.id },
        })
      ).description,
    ).toBe('Updated profile');
    expect(await client.project.count()).toBe(1);
    expect(await client.projectSkill.count()).toBe(1);
    expect(
      await client.skill.findUnique({ where: { id: 'playwright' } }),
    ).toBeNull();
    expect(await client.profileLink.count()).toBe(1);
  });

  it('serializes concurrent seeds without duplicates', async () => {
    await Promise.all([
      seedProfile(client, profileData),
      seedProfile(client, profileData),
    ]);
    expect(await client.project.count()).toBe(3);
  });

  it('rolls back all changes if a database write fails halfway through seed', async () => {
    const changed = structuredClone(profileData);
    changed.description = 'Must roll back';
    await client.profile.upsert({
      where: { id: 'unrelated' },
      create: {
        id: 'unrelated',
        name: 'Other',
        headline: 'Other',
        description: 'Other',
      },
      update: {},
    });
    await client.profileLink.create({
      data: {
        id: 'collision',
        profileId: 'unrelated',
        label: 'Other',
        url: 'https://example.org/',
        sortOrder: 0,
      },
    });
    changed.links.push({
      id: 'collision',
      label: 'Conflict',
      url: 'https://example.org/',
    });
    await expect(seedProfile(client, changed)).rejects.toThrow();
    expect(
      (
        await client.profile.findUniqueOrThrow({
          where: { id: profileData.id },
        })
      ).description,
    ).toBe(profileData.description);
    expect(
      (
        await client.profileLink.findUniqueOrThrow({
          where: { id: 'collision' },
        })
      ).profileId,
    ).toBe('unrelated');
  });

  it('serves readiness/liveness and Sandbox under NODE_ENV=production', async () => {
    await request(server).get('/').expect(302).expect('location', '/graphql');
    await request(server).get('/health/live').expect(200, { status: 'ok' });
    await request(server)
      .get('/health/ready')
      .expect(200, { status: 'ok', database: 'up', profile: 'ready' });
    const response = await request(server)
      .get('/graphql')
      .set('accept', 'text/html')
      .expect(200);
    expect(response.text).toContain('embeddable-sandbox');
    expect(response.text).toContain('BusinessCard');
  });

  it('allows the standard introspection query used by GraphQL IDEs', async () => {
    const response = await query(getIntrospectionQuery()).expect(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.__schema.queryType.name).toBe('Query');
  });

  it('can disable Sandbox and introspection while retaining the public API', async () => {
    process.env.DEMO_SANDBOX = 'false';
    const fixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    const closed = fixture.createNestApplication({
      bodyParser: false,
      logger: false,
    });
    configureHttp(closed, readEnvironment());
    try {
      await closed.init();
      const closedServer = closed.getHttpServer() as Server;
      await request(closedServer)
        .post('/graphql')
        .send({ query: '{ profile { name } }' })
        .expect(200);
      await request(closedServer)
        .post('/graphql')
        .send({ query: getIntrospectionQuery() })
        .expect(400);
      const page = await request(closedServer)
        .get('/graphql')
        .set('accept', 'text/html')
        .expect(400);
      expect(page.text).not.toContain('embeddable-sandbox');
      expect(page.headers['content-security-policy']).toBeDefined();
    } finally {
      await closed.close();
      process.env.DEMO_SANDBOX = 'true';
    }
  });

  it('reports missing seeded data without disclosing internals', async () => {
    await client.profile.delete({ where: { id: profileData.id } });
    await request(server).get('/health/ready').expect(503);
    const response = await query('{ profile { name } }').expect(200);
    expect(response.body.errors[0]).toMatchObject({
      extensions: { code: 'NOT_FOUND' },
    });
    expect(JSON.stringify(response.body)).not.toMatch(
      /stacktrace|node_modules|Prisma/,
    );
  });

  it('masks unexpected database errors in API responses', async () => {
    vi.spyOn(app.get(ProfileRepository), 'findProfiles').mockRejectedValueOnce(
      new Error('secret SQL connection password'),
    );
    const response = await query('{ profile { name } }').expect(200);
    expect(response.body.errors[0]).toMatchObject({
      message: 'An unexpected error occurred.',
    });
    expect(JSON.stringify(response.body)).not.toMatch(
      /secret|password|stacktrace/,
    );
  });

  it('rejects excessive aliases before any database query', async () => {
    const fields = Array.from(
      { length: 301 },
      (_, index) => `alias${index}: name`,
    ).join(' ');
    const response = await query(`{ profile { ${fields} } }`).expect(400);
    expect(response.body.errors[0].extensions.code).toBe('QUERY_TOO_COMPLEX');
    expect(queries).toHaveLength(0);
  });

  it('rejects excessive introspection depth before any database query', async () => {
    const nested = `${'ofType { '.repeat(20)}name${' }'.repeat(20)}`;
    await query(
      `{ __type(name: "Profile") { fields { type { ${nested} } } } }`,
    ).expect(400);
    expect(queries).toHaveLength(0);
  });

  it('limits request body size and rejects cross-site simple requests', async () => {
    await request(server)
      .post('/graphql')
      .send({ query: ' '.repeat(17000) })
      .expect(413);
    await request(server)
      .get('/graphql')
      .query({ query: '{ profile { name } }' })
      .expect(400);
    expect(queries).toHaveLength(0);
  });

  it('rejects mutations, unknown fields and HTTP operation batching', async () => {
    const mutation = await query('mutation { deleteProfile }').expect(200);
    expect(mutation.body.errors).toHaveLength(1);
    expect(queries).toHaveLength(0);
    await query('{ profile { password } }').expect(400);
    await request(server)
      .post('/graphql')
      .send([{ query: '{ profile { name } }' }])
      .expect(400);
  });

  it('applies a rate limit to GraphQL requests', async () => {
    const fixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    const limited = fixture.createNestApplication({
      bodyParser: false,
      logger: false,
    });
    configureHttp(limited, { ...readEnvironment(), RATE_LIMIT_MAX: 2 });
    await limited.init();
    try {
      const limitedServer = limited.getHttpServer() as Server;
      await request(limitedServer)
        .post('/graphql')
        .send({ query: '{ profile { name } }' })
        .expect(200);
      await request(limitedServer)
        .post('/graphql')
        .send({ query: '{ profile { name } }' })
        .expect(200);
      const response = await request(limitedServer)
        .post('/graphql')
        .send({ query: '{ profile { name } }' })
        .expect(429);
      expect(response.headers['retry-after']).toBeDefined();
      expect(response.body.errors[0].extensions.code).toBe('RATE_LIMITED');
    } finally {
      await limited.close();
    }
  });

  it('matches the committed GraphQL contract through HTTP introspection', async () => {
    const response = await query(getIntrospectionQuery()).expect(200);
    const actual = printSchema(buildClientSchema(response.body.data));
    expect(actual).toBe(
      printSchema(buildSchema(readFileSync('schema.graphql', 'utf8'))),
    );
  });
});
