import { spawnSync } from 'node:child_process';

// Preview builds must never migrate or overwrite a shared production database.
if (process.env.VERCEL_ENV !== 'production') {
  console.info('Database preparation skipped outside Vercel Production.');
  process.exit(0);
}

if (!process.env.DATABASE_URL) {
  console.error(
    'DATABASE_URL is required. Connect PostgreSQL to the Vercel Production environment.',
  );
  process.exit(1);
}

for (const args of [
  ['node_modules/prisma/build/index.js', 'migrate', 'deploy'],
  ['dist/database/seed.js'],
]) {
  const result = spawnSync(process.execPath, args, { stdio: 'inherit' });
  if (result.error || result.status !== 0) {
    console.error('Vercel database preparation failed. Deployment stopped.');
    process.exit(result.status ?? 1);
  }
}
