# Project guidance

## Scope and sources

- Read `test-task-spec.md` when it is available locally. The public acceptance contract is documented in `README.md` and `schema.graphql`.
- Use `fullstack_cv.md` when available locally and the owner's corrections as factual sources. The public dataset lives in `src/database/profile.data.ts`. Do not invent employment details, achievements, metrics, proficiency levels, or project URLs.
- The implementation plan has been approved. Implement and verify the application autonomously within that scope.
- Communicate with the user in Russian. Use consistent English identifiers in code.

## Engineering principles

- Prefer a small, understandable NestJS application with clear boundaries between GraphQL transport, application logic, and Prisma data access.
- Add abstractions and dependencies only when they solve a concrete requirement. Explain material tradeoffs in the README.
- Preserve compatibility with the sample `profile` query in the specification.
- Load nested relations when requested. Prevent N+1 queries where lists resolve related data, and verify this against PostgreSQL.
- Keep request-local batching/cache state isolated between GraphQL operations; reuse the database client and connection pool.
- Make ordering deterministic and preserve the month-level precision of employment dates from the CV.

## Data and startup

- Keep public profile data in a dedicated, validated seed dataset. Do not make the running application parse the CV.
- Publish only professional information needed for the business card. Do not copy the raw CV, phone number, birth date, or unrelated personal details into public artifacts by default.
- Commit reviewed migrations. Startup must apply migrations and explicitly seed an empty database without manual SQL.
- Make seeding transactional and repeatable: subsequent runs must converge to the intended dataset without duplicate records or stale managed relations.
- Do not reset an existing database as part of ordinary startup. Fail clearly if migration or seeding fails.
- Keep credentials out of version control; document configuration with non-secret examples.

## Verification and delivery

- Use Node.js from `.nvmrc`; the application also runs entirely through Docker without host Node.js.
- After `npm ci`, run `npm run db:generate` before typechecking or tests. Generated Prisma sources are not committed.
- Run `npm run verify` for source checks. For integration tests, start `docker compose --profile test up -d --wait db-test` and supply `TEST_DATABASE_URL` for the dedicated `_test` database described in the README.

- Pin a compatible stable toolchain and commit the dependency lockfile.
- Test meaningful behavior: the required GraphQL query, nested data, SQL query growth, repeatable seeding, and error handling.
- Use real PostgreSQL for database integration tests. Database mocks alone do not establish correctness.
- Before delivery, verify a clean Docker build and startup with a fresh database, then verify restart with persisted data.
- Check the deployed Sandbox in a browser and execute a real query against the deployed API.
- Document startup, example queries, architecture decisions, checks, and deployment. Report only checks actually executed and measurements actually observed.
- Keep source CV and local planning inputs out of public Git history and Docker images. Deployment needs an identified destination and account access.
