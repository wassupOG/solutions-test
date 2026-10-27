import type { DatabaseClient } from './client.js';
import { profileDataSchema, type ProfileData } from './profile-data.schema.js';

export async function seedProfile(client: DatabaseClient, input: ProfileData) {
  const data = profileDataSchema.parse(input);
  const { links, skills, experience, projects, ...profile } = data;

  await client.$transaction(
    async (tx) => {
      // Serialize seeds for this dataset across concurrent app starts.
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${profile.id}))::text`;
      await tx.profile.upsert({
        where: { id: profile.id },
        create: profile,
        update: profile,
      });

      // IDs are global. Never let an upsert move another profile's child row.
      const ownershipConflicts = await Promise.all([
        tx.profileLink.count({
          where: {
            id: { in: links.map((item) => item.id) },
            profileId: { not: profile.id },
          },
        }),
        tx.skill.count({
          where: {
            id: { in: skills.map((item) => item.id) },
            profileId: { not: profile.id },
          },
        }),
        tx.experience.count({
          where: {
            id: { in: experience.map((item) => item.id) },
            profileId: { not: profile.id },
          },
        }),
        tx.project.count({
          where: {
            id: { in: projects.map((item) => item.id) },
            profileId: { not: profile.id },
          },
        }),
      ]);
      if (ownershipConflicts.some((count) => count > 0)) {
        throw new Error('Seed identifiers conflict with another profile.');
      }

      // Only this profile's rows are managed. Upsert stable IDs; reconcile removed rows.
      await tx.project.deleteMany({
        where: {
          profileId: profile.id,
          id: { notIn: projects.map((item) => item.id) },
        },
      });
      await tx.skill.deleteMany({
        where: {
          profileId: profile.id,
          id: { notIn: skills.map((item) => item.id) },
        },
      });
      await tx.profileLink.deleteMany({
        where: {
          profileId: profile.id,
          id: { notIn: links.map((item) => item.id) },
        },
      });
      await tx.experience.deleteMany({
        where: {
          profileId: profile.id,
          id: { notIn: experience.map((item) => item.id) },
        },
      });

      for (const [sortOrder, link] of links.entries()) {
        const row = { ...link, profileId: profile.id, sortOrder };
        await tx.profileLink.upsert({
          where: { id: row.id, profileId: profile.id },
          create: row,
          update: row,
        });
      }
      for (const [sortOrder, skill] of skills.entries()) {
        const row = { ...skill, profileId: profile.id, sortOrder };
        await tx.skill.upsert({
          where: { id: row.id, profileId: profile.id },
          create: row,
          update: row,
        });
      }
      for (const item of experience) {
        const row = { ...item, profileId: profile.id };
        await tx.experience.upsert({
          where: { id: row.id, profileId: profile.id },
          create: row,
          update: row,
        });
      }
      for (const [sortOrder, project] of projects.entries()) {
        const { skillIds, ...fields } = project;
        const row = { ...fields, profileId: profile.id, sortOrder };
        await tx.project.upsert({
          where: { id: row.id, profileId: profile.id },
          create: row,
          update: row,
        });
        await tx.projectSkill.deleteMany({ where: { projectId: row.id } });
        await tx.projectSkill.createMany({
          data: skillIds.map((skillId) => ({ projectId: row.id, skillId })),
        });
      }
    },
    { timeout: 15000 },
  );
}
