import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module.js';
import {
  ProfileResolver,
  ProjectResolver,
} from './graphql/profile.resolver.js';
import { ProfileRepository } from './profile.repository.js';
import { ProfileService } from './profile.service.js';

@Module({
  imports: [DatabaseModule],
  providers: [
    ProfileResolver,
    ProjectResolver,
    ProfileRepository,
    ProfileService,
  ],
  exports: [ProfileService],
})
export class ProfileModule {}
