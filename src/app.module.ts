import { HttpException, Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloServerPluginLandingPageDisabled } from '@apollo/server/plugin/disabled';
import { unwrapResolverError } from '@apollo/server/errors';
import { depthLimit } from '@graphile/depth-limit';
import { ConfigModule, ENVIRONMENT } from './config/config.module.js';
import type { Environment } from './config/environment.js';
import { DatabaseModule } from './database/database.module.js';
import { ProfileModule } from './profile/profile.module.js';
import { ProfileService } from './profile/profile.service.js';
import { HealthController } from './health/health.controller.js';
import { queryBudgetPlugin } from './graphql/query-budget.plugin.js';
import { DEMO_QUERY } from './graphql/demo-query.js';
import { EntryController } from './entry.controller.js';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    ProfileModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ProfileModule],
      inject: [ENVIRONMENT, ProfileService],
      useFactory: (
        environment: Environment,
        profileService: ProfileService,
      ): ApolloDriverConfig => ({
        driver: ApolloDriver,
        autoSchemaFile: true,
        sortSchema: true,
        playground: false,
        introspection: environment.DEMO_SANDBOX,
        includeStacktraceInErrorResponses: false,
        allowBatchedHttpRequests: false,
        csrfPrevention: true,
        validationRules: [depthLimit({ maxDepth: 8, maxListDepth: 3 })],
        context: () => ({ loaders: profileService.createLoaders() }),
        plugins: [
          queryBudgetPlugin(),
          environment.DEMO_SANDBOX
            ? ApolloServerPluginLandingPageLocalDefault({
                embed: { runTelemetry: false, endpointIsEditable: false },
                document: DEMO_QUERY,
                footer: false,
              })
            : ApolloServerPluginLandingPageDisabled(),
        ],
        formatError: (formattedError, error) => {
          const original = unwrapResolverError(error);
          if (
            original instanceof HttpException &&
            original.getStatus() === 404
          ) {
            return {
              message: original.message,
              path: formattedError.path,
              extensions: { code: 'NOT_FOUND' },
            };
          }
          if (formattedError.extensions?.code === 'INTERNAL_SERVER_ERROR') {
            return {
              message: 'An unexpected error occurred.',
              path: formattedError.path,
              extensions: { code: 'INTERNAL_SERVER_ERROR' },
            };
          }
          return formattedError;
        },
      }),
    }),
  ],
  controllers: [EntryController, HealthController],
})
export class AppModule {}
