import type { INestApplication } from '@nestjs/common';
import express from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { pinoHttp } from 'pino-http';
import { randomUUID } from 'node:crypto';
import type { Environment } from './environment.js';

export function configureHttp(app: INestApplication, environment: Environment) {
  const server = app.getHttpAdapter().getInstance() as express.Express;
  server.disable('x-powered-by');
  server.set('trust proxy', environment.TRUST_PROXY_HOPS || false);

  app.use(
    pinoHttp({
      level: environment.LOG_LEVEL,
      genReqId: (_req, res) => {
        const id = randomUUID();
        res.setHeader('x-request-id', id);
        return id;
      },
      serializers: {
        req: (req: { id: string; method: string }) => ({
          id: req.id,
          method: req.method,
        }),
        res: (res: { statusCode: number }) => ({ statusCode: res.statusCode }),
      },
      customProps: () => ({ service: 'digital-business-card' }),
    }),
  );
  app.use(
    helmet({
      // Demo mode permits Apollo's hosted Sandbox resources.
      contentSecurityPolicy: environment.DEMO_SANDBOX ? false : undefined,
      crossOriginEmbedderPolicy: !environment.DEMO_SANDBOX,
    }),
  );
  app.use(express.json({ limit: '16kb' }));
  app.use(
    '/graphql',
    rateLimit({
      windowMs: 60_000,
      limit: environment.RATE_LIMIT_MAX,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
      message: {
        errors: [
          {
            message: 'Too many requests. Please try again shortly.',
            extensions: { code: 'RATE_LIMITED' },
          },
        ],
      },
    }),
  );
}
