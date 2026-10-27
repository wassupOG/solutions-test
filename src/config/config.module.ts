import { Global, Module } from '@nestjs/common';
import { readEnvironment } from './environment.js';

export const ENVIRONMENT = Symbol('ENVIRONMENT');

@Global()
@Module({
  providers: [{ provide: ENVIRONMENT, useFactory: () => readEnvironment() }],
  exports: [ENVIRONMENT],
})
export class ConfigModule {}
