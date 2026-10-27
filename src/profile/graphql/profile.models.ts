import { Field, ID, ObjectType } from '@nestjs/graphql';
import type {
  ProfileRecord,
  ExperienceRecord,
  LinkRecord,
  ProjectRecord,
  SkillRecord,
} from '../profile.types.js';

@ObjectType('ProfessionalLink', {
  description: 'A public professional resource or contact.',
})
export class ProfessionalLink implements Omit<
  LinkRecord,
  'profileId' | 'sortOrder'
> {
  @Field(() => ID) id: string;
  @Field() label: string;
  @Field({ description: 'HTTPS URL supplied by the profile owner.' })
  url: string;
}

@ObjectType('Skill', {
  description:
    'A technology used in professional work; no self-assigned proficiency scores.',
})
export class Skill implements Omit<SkillRecord, 'profileId' | 'sortOrder'> {
  @Field(() => ID) id: string;
  @Field() name: string;
  @Field({
    description:
      'Technology category: Language, Backend, Data, Frontend, Infrastructure or Testing.',
  })
  category: string;
}

@ObjectType('Experience', {
  description: 'Employment history, ordered by start month descending.',
})
export class Experience implements Omit<ExperienceRecord, 'profileId'> {
  @Field(() => ID) id: string;
  @Field() company: string;
  @Field() position: string;
  @Field({
    description:
      'First month, formatted YYYY-MM. The source CV does not specify a day.',
  })
  startMonth: string;
  @Field(() => String, {
    nullable: true,
    description:
      'Last month, formatted YYYY-MM; null means current employment.',
  })
  endMonth: string | null;
  @Field() description: string;
  @Field(() => [String], {
    description: 'Selected achievements from the CV, in presentation order.',
  })
  achievements: string[];
}

@ObjectType('Project', {
  description:
    'A publicly accessible product and the candidate’s personal contribution.',
})
export class Project implements Omit<ProjectRecord, 'profileId' | 'sortOrder'> {
  @Field(() => ID) id: string;
  @Field() name: string;
  @Field() description: string;
  @Field({
    description:
      'The candidate’s contribution; does not imply sole ownership of the product.',
  })
  contribution: string;
  @Field({
    description:
      'Public product URL; commercial source repositories are private.',
  })
  url: string;
  @Field(() => [Skill], {
    description:
      'Technologies confirmed for this project, fetched in a batch when selected.',
  })
  skills: Skill[];
}

@ObjectType('Profile', {
  description: 'Ilya Naumov’s public professional business card.',
})
export class Profile implements ProfileRecord {
  @Field(() => ID) id: string;
  @Field() name: string;
  @Field() headline: string;
  @Field() description: string;
  @Field(() => [ProfessionalLink]) links: ProfessionalLink[];
  @Field(() => [Skill]) skills: Skill[];
  @Field(() => [Experience]) experience: Experience[];
  @Field(() => [Project]) projects: Project[];
}
