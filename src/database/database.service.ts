import {
  Inject,
  Injectable,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';
import { ENVIRONMENT } from '../config/config.module.js';
import type { Environment } from '../config/environment.js';
import { createDatabaseClient } from './client.js';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  readonly client;

  constructor(@Inject(ENVIRONMENT) environment: Environment) {
    this.client = createDatabaseClient(environment.DATABASE_URL);
  }

  async onModuleInit() {
    await this.client.$connect();
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }
}
