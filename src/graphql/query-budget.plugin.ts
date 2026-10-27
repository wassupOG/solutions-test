import type { ApolloServerPlugin, BaseContext } from '@apollo/server';
import { GraphQLError } from 'graphql';
import { getComplexity, simpleEstimator } from 'graphql-query-complexity';

export const MAX_QUERY_COMPLEXITY = 300;

export function queryBudgetPlugin(): ApolloServerPlugin<BaseContext> {
  return {
    async requestDidStart() {
      return {
        async didResolveOperation({ schema, document, request }) {
          const complexity = getComplexity({
            schema,
            query: document,
            operationName: request.operationName,
            variables: request.variables,
            estimators: [simpleEstimator({ defaultComplexity: 1 })],
          });
          if (complexity > MAX_QUERY_COMPLEXITY) {
            throw new GraphQLError(
              `Query exceeds the ${MAX_QUERY_COMPLEXITY}-field budget.`,
              {
                extensions: {
                  code: 'QUERY_TOO_COMPLEX',
                  http: { status: 400 },
                },
              },
            );
          }
        },
      };
    },
  };
}
