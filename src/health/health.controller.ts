import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { PUBLIC_PROFILE_ID } from '../profile/profile.types.js';

@Controller('health')
export class HealthController {
  constructor(private readonly database: DatabaseService) {}

  @Get('live')
  live() {
    return { status: 'ok' };
  }

  @Get('ready')
  async ready() {
    try {
      const profile = await this.database.client.profile.findUnique({
        where: { id: PUBLIC_PROFILE_ID },
        select: { id: true },
      });
      if (!profile) throw new Error('Profile not initialized');
      return { status: 'ok', database: 'up', profile: 'ready' };
    } catch {
      throw new ServiceUnavailableException('Service is not ready.');
    }
  }
}
