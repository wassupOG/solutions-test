import { Injectable, NotFoundException } from '@nestjs/common';
import { ProfileRepository } from './profile.repository.js';
import {
  createProfileLoaders,
  type ProfileLoaders,
} from './profile.loaders.js';
import { PUBLIC_PROFILE_ID } from './profile.types.js';

@Injectable()
export class ProfileService {
  constructor(private readonly repository: ProfileRepository) {}

  createLoaders() {
    return createProfileLoaders(this.repository);
  }

  async getProfile(loaders: ProfileLoaders) {
    const profile = await loaders.profile.load(PUBLIC_PROFILE_ID);
    if (!profile)
      throw new NotFoundException('The public profile is not available.');
    return profile;
  }
}
