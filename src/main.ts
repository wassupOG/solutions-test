import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ConsoleLogger } from '@nestjs/common';
import { AppModule } from './app.module.js';
import { ENVIRONMENT } from './config/config.module.js';
import type { Environment } from './config/environment.js';
import { configureHttp } from './config/configure-http.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
    logger: new ConsoleLogger({ json: true }),
  });
  const environment = app.get<Environment>(ENVIRONMENT);
  configureHttp(app, environment);
  app.enableShutdownHooks();
  await app.listen(environment.PORT, '0.0.0.0');
}
await bootstrap();
