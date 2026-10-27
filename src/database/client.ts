import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

export function createDatabaseClient(url: string) {
  return new PrismaClient({
    adapter: new PrismaPg(
      { connectionString: url, max: 5, connectionTimeoutMillis: 5000 },
      { schema: new URL(url).searchParams.get('schema') ?? 'public' },
    ),
    log: [{ emit: 'event', level: 'query' }],
  });
}

export type DatabaseClient = ReturnType<typeof createDatabaseClient>;
