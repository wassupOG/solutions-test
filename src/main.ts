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
  await app.listen(environment.PORT);
}

// Vercel captures listen() while loading this module. Keep ESM evaluation free
// to finish so the platform can attach its listener to the Nest HTTP server.
void bootstrap();
