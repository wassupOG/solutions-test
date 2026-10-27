export interface ProfileRecord {
  id: string;
  name: string;
  headline: string;
  description: string;
}
export interface LinkRecord {
  id: string;
  profileId: string;
  label: string;
  url: string;
  sortOrder: number;
}
export interface SkillRecord {
  id: string;
  profileId: string;
  name: string;
  category: string;
  sortOrder: number;
}
export interface ExperienceRecord {
  id: string;
  profileId: string;
  company: string;
  position: string;
  startMonth: string;
  endMonth: string | null;
  description: string;
  achievements: string[];
}
export interface ProjectRecord {
  id: string;
  profileId: string;
  name: string;
  description: string;
  contribution: string;
  url: string;
  sortOrder: number;
}

export const PUBLIC_PROFILE_ID = 'ilya-naumov';
