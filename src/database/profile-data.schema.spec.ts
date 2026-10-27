import { profileDataSchema } from './profile-data.schema.js';
import { profileData } from './profile.data.js';

describe('public dataset', () => {
  it('contains the supplied public URLs and four employment records', () => {
    expect(profileData.experience).toHaveLength(4);
    expect(profileData.projects.map((project) => project.url)).toEqual([
      'https://vayvnd.net/',
      'https://lendswap.com/',
      'https://lendao.com/',
    ]);
    expect(profileData.links).toContainEqual(
      expect.objectContaining({ url: 'https://github.com/wassupOG' }),
    );
  });

  it('rejects dangling or duplicate project skills', () => {
    const data = structuredClone(profileData);
    data.projects[0]!.skillIds = ['unknown'];
    expect(() => profileDataSchema.parse(data)).toThrow(
      'Unknown skill reference',
    );
    data.projects[0]!.skillIds = ['typescript', 'typescript'];
    expect(() => profileDataSchema.parse(data)).toThrow('Duplicate skills');
  });

  it('preserves month precision and rejects reversed periods', () => {
    const data = structuredClone(profileData);
    data.experience[0]!.endMonth = '2020-01';
    expect(() => profileDataSchema.parse(data)).toThrow(
      'Invalid employment period',
    );
    data.experience[0]!.startMonth = '2025-13';
    expect(profileDataSchema.safeParse(data).success).toBe(false);
  });

  it('rejects duplicate identities before database writes', () => {
    const data = structuredClone(profileData);
    data.skills.push(data.skills[0]!);
    expect(() => profileDataSchema.parse(data)).toThrow(
      'Duplicate identifiers',
    );
  });
});
