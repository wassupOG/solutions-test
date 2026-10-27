import { z } from 'zod';

const booleanString = z
  .enum(['true', 'false'])
  .transform((value) => value === 'true');

const environmentSchema = z.object({
  DATABASE_URL: z
    .url()
    .refine((url) => /^postgres(ql)?:/.test(url), 'Use a PostgreSQL URL'),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DEMO_SANDBOX: booleanString.default(true),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'silent'])
    .default('info'),
  RATE_LIMIT_MAX: z.coerce.number().int().min(1).default(120),
  TRUST_PROXY_HOPS: z.coerce.number().int().min(0).max(5).default(0),
});

export type Environment = z.infer<typeof environmentSchema>;

export function readEnvironment(
  source: NodeJS.ProcessEnv = process.env,
): Environment {
  const result = environmentSchema.safeParse(source);
  if (!result.success) {
    // Only field names and validation messages; never echo connection strings.
    const issues = result.error.issues.map(
      (issue) => `${issue.path.join('.')}: ${issue.message}`,
    );
    throw new Error(`Invalid environment: ${issues.join('; ')}`);
  }
  return result.data;
}
