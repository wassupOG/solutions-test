import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { GraphQLSchemaHost } from '@nestjs/graphql';
import { printSchema } from 'graphql';
import { writeFile } from 'node:fs/promises';
import { AppModule } from '../dist/app.module.js';

const app = await NestFactory.create(AppModule, { logger: false });
try {
  await app.init();
  await writeFile(
    'schema.graphql',
    `${printSchema(app.get(GraphQLSchemaHost).schema)}\n`,
  );
} finally {
  await app.close();
}
