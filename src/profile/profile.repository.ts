import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';

@Injectable()
export class ProfileRepository {
  constructor(private readonly database: DatabaseService) {}

  findProfiles(ids: readonly string[]) {
    return this.database.client.profile.findMany({
      where: { id: { in: [...ids] } },
    });
  }

  findLinks(profileIds: readonly string[]) {
    return this.database.client.profileLink.findMany({
      where: { profileId: { in: [...profileIds] } },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });
  }

  findSkills(profileIds: readonly string[]) {
    return this.database.client.skill.findMany({
      where: { profileId: { in: [...profileIds] } },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });
  }

  findExperience(profileIds: readonly string[]) {
    return this.database.client.experience.findMany({
      where: { profileId: { in: [...profileIds] } },
      orderBy: [{ startMonth: 'desc' }, { id: 'asc' }],
    });
  }

  findProjects(profileIds: readonly string[]) {
    return this.database.client.project.findMany({
      where: { profileId: { in: [...profileIds] } },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });
  }

  findProjectSkills(projectIds: readonly string[]) {
    return this.database.client.projectSkill.findMany({
      where: { projectId: { in: [...projectIds] } },
      include: { skill: true },
      orderBy: [{ skill: { sortOrder: 'asc' } }, { skillId: 'asc' }],
    });
  }
}
