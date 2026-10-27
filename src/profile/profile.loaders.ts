import DataLoader from 'dataloader';
import type { ProfileRepository } from './profile.repository.js';
import type {
  ExperienceRecord,
  LinkRecord,
  ProfileRecord,
  ProjectRecord,
  SkillRecord,
} from './profile.types.js';

function groupByKey<T>(
  keys: readonly string[],
  rows: readonly T[],
  keyOf: (row: T) => string,
): T[][] {
  const groups = new Map<string, T[]>();
  for (const row of rows) {
    const key = keyOf(row);
    const group = groups.get(key) ?? [];
    group.push(row);
    groups.set(key, group);
  }
  // Preserve key order and return [] for parents without children.
  return keys.map((key) => groups.get(key) ?? []);
}

export function createProfileLoaders(repository: ProfileRepository) {
  return {
    profile: new DataLoader<string, ProfileRecord | null>(async (keys) => {
      const rows = await repository.findProfiles(keys);
      const byId = new Map(rows.map((row) => [row.id, row]));
      return keys.map((key) => byId.get(key) ?? null);
    }),
    links: new DataLoader<string, LinkRecord[]>(async (keys) =>
      groupByKey(
        keys,
        await repository.findLinks(keys),
        (row) => row.profileId,
      ),
    ),
    skills: new DataLoader<string, SkillRecord[]>(async (keys) =>
      groupByKey(
        keys,
        await repository.findSkills(keys),
        (row) => row.profileId,
      ),
    ),
    experience: new DataLoader<string, ExperienceRecord[]>(async (keys) =>
      groupByKey(
        keys,
        await repository.findExperience(keys),
        (row) => row.profileId,
      ),
    ),
    projects: new DataLoader<string, ProjectRecord[]>(async (keys) =>
      groupByKey(
        keys,
        await repository.findProjects(keys),
        (row) => row.profileId,
      ),
    ),
    projectSkills: new DataLoader<string, SkillRecord[]>(async (keys) => {
      const grouped = groupByKey(
        keys,
        await repository.findProjectSkills(keys),
        (row) => row.projectId,
      );
      return grouped.map((rows) => rows.map((row) => row.skill));
    }),
  };
}

export type ProfileLoaders = ReturnType<typeof createProfileLoaders>;
export interface ProfileContext {
  loaders: ProfileLoaders;
}
