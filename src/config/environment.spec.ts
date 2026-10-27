import { readEnvironment } from './environment.js';

const valid = {
  DATABASE_URL: 'postgresql://user:secret@localhost:5432/business_card',
};

describe('environment validation', () => {
  it('parses defaults and explicit booleans', () => {
    expect(readEnvironment(valid)).toMatchObject({
      PORT: 3000,
      DEMO_SANDBOX: true,
      TRUST_PROXY_HOPS: 0,
    });
    expect(
      readEnvironment({ ...valid, DEMO_SANDBOX: 'false' }).DEMO_SANDBOX,
    ).toBe(false);
  });

  it.each([
    { PORT: '0' },
    { PORT: '65536' },
    { DEMO_SANDBOX: 'yes' },
    { DATABASE_URL: 'https://example.com' },
    { TRUST_PROXY_HOPS: '-1' },
  ])('rejects invalid configuration %j', (override) => {
    expect(() => readEnvironment({ ...valid, ...override })).toThrow(
      'Invalid environment',
    );
  });

  it('does not expose the connection string in validation errors', () => {
    expect(() =>
      readEnvironment({ DATABASE_URL: 'private-value-not-a-url' }),
    ).toThrow(/DATABASE_URL/);
    try {
      readEnvironment({ DATABASE_URL: 'private-value-not-a-url' });
    } catch (error) {
      expect(String(error)).not.toContain('private-value-not-a-url');
    }
  });
});
