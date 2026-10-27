import { z } from 'zod';

const text = z.string().trim().min(1);
const id = text.regex(/^[a-z0-9-]+$/);
const month = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);
const webUrl = z
  .url()
  .refine((value) => value.startsWith('https://'), 'Use an HTTPS URL');

export const profileDataSchema = z
  .object({
    id,
    name: text,
    headline: text,
    description: text,
    links: z.array(z.object({ id, label: text, url: webUrl })).min(1),
    skills: z.array(z.object({ id, name: text, category: text })).min(1),
    experience: z
      .array(
        z
          .object({
            id,
            company: text,
            position: text,
            startMonth: month,
            endMonth: month.nullable(),
            description: text,
            achievements: z.array(text).min(1),
          })
          .refine(
            (item) =>
              item.endMonth === null || item.endMonth >= item.startMonth,
            'Invalid employment period',
          ),
      )
      .min(1),
    projects: z
      .array(
        z.object({
          id,
          name: text,
          description: text,
          contribution: text,
          url: webUrl,
          skillIds: z.array(id).min(1),
        }),
      )
      .min(1),
  })
  .superRefine((data, context) => {
    const groups = [data.links, data.skills, data.experience, data.projects];
    for (const group of groups) {
      if (new Set(group.map((item) => item.id)).size !== group.length) {
        context.addIssue({
          code: 'custom',
          message: 'Duplicate identifiers in dataset',
        });
      }
    }
    if (
      new Set(data.skills.map((item) => item.name)).size !== data.skills.length
    ) {
      context.addIssue({ code: 'custom', message: 'Duplicate skill names' });
    }
    if (
      new Set(data.links.map((item) => item.url)).size !== data.links.length
    ) {
      context.addIssue({
        code: 'custom',
        message: 'Duplicate professional URLs',
      });
    }
    const skillIds = new Set(data.skills.map((skill) => skill.id));
    for (const project of data.projects) {
      if (project.skillIds.some((skillId) => !skillIds.has(skillId))) {
        context.addIssue({
          code: 'custom',
          message: `Unknown skill reference in ${project.id}`,
        });
      }
      if (new Set(project.skillIds).size !== project.skillIds.length) {
        context.addIssue({
          code: 'custom',
          message: `Duplicate skills in ${project.id}`,
        });
      }
    }
  });

export type ProfileData = z.infer<typeof profileDataSchema>;
