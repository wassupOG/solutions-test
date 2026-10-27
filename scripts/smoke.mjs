const origin = process.env.SMOKE_URL ?? 'http://localhost:3000';
const timeout = () => AbortSignal.timeout(10000);
const ready = await fetch(`${origin}/health/ready`, { signal: timeout() });
if (!ready.ok) throw new Error(`Readiness failed: ${ready.status}`);

const response = await fetch(`${origin}/graphql`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    query:
      '{ profile { name links { url } experience { company } projects { name url skills { name } } } }',
  }),
  signal: timeout(),
});
const result = await response.json();
if (!response.ok || result.errors || !result.data?.profile?.name) {
  throw new Error('GraphQL smoke query failed');
}
if (
  result.data.profile.projects.some(
    (project) => !project.url || project.skills.length === 0,
  )
) {
  throw new Error('Projects are missing URLs or technologies');
}
const sandbox = await fetch(`${origin}/graphql`, {
  headers: { accept: 'text/html' },
  signal: timeout(),
});
if (!sandbox.ok || !(await sandbox.text()).includes('embeddable-sandbox')) {
  throw new Error('Apollo Sandbox is unavailable');
}
console.info(
  JSON.stringify({
    status: 'ok',
    name: result.data.profile.name,
    projects: result.data.profile.projects.length,
    sandbox: 'available',
  }),
);
