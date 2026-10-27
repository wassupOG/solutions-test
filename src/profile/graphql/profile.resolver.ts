import {
  Context,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { ProfileService } from '../profile.service.js';
import type { ProfileContext } from '../profile.loaders.js';
import type { ProfileRecord, ProjectRecord } from '../profile.types.js';
import {
  Experience,
  ProfessionalLink,
  Profile,
  Project,
  Skill,
} from './profile.models.js';

@Resolver(() => Profile)
export class ProfileResolver {
  constructor(private readonly service: ProfileService) {}

  @Query(() => Profile, {
    description:
      'Get the public profile. Related collections are loaded only when selected.',
  })
  profile(@Context() context: ProfileContext) {
    return this.service.getProfile(context.loaders);
  }

  @ResolveField(() => [ProfessionalLink])
  links(@Parent() profile: ProfileRecord, @Context() context: ProfileContext) {
    return context.loaders.links.load(profile.id);
  }

  @ResolveField(() => [Skill])
  skills(@Parent() profile: ProfileRecord, @Context() context: ProfileContext) {
    return context.loaders.skills.load(profile.id);
  }

  @ResolveField(() => [Experience])
  experience(
    @Parent() profile: ProfileRecord,
    @Context() context: ProfileContext,
  ) {
    return context.loaders.experience.load(profile.id);
  }

  @ResolveField(() => [Project])
  projects(
    @Parent() profile: ProfileRecord,
    @Context() context: ProfileContext,
  ) {
    return context.loaders.projects.load(profile.id);
  }
}

@Resolver(() => Project)
export class ProjectResolver {
  @ResolveField(() => [Skill])
  skills(@Parent() project: ProjectRecord, @Context() context: ProfileContext) {
    return context.loaders.projectSkills.load(project.id);
  }
}
