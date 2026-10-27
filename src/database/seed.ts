import 'dotenv/config';
import { readEnvironment } from '../config/environment.js';
import { createDatabaseClient } from './client.js';
import { profileData } from './profile.data.js';
import { seedProfile } from './seed-profile.js';

const client = createDatabaseClient(readEnvironment().DATABASE_URL);
try {
  await seedProfile(client, profileData);
  console.info(
    JSON.stringify({ event: 'database.seeded', profileId: profileData.id }),
  );
} catch {
  console.error(
    JSON.stringify({
      event: 'database.seed_failed',
      message: 'Check database connectivity and seed constraints.',
    }),
  );
  process.exitCode = 1;
} finally {
  await client.$disconnect();
}
