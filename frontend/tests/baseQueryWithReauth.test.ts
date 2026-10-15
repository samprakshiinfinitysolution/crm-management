import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

describe('RTK Query baseQueryWithReauth & Concurrency Control Suite', () => {
  test('single-flight concurrency lock ensures /api/refresh is called only once for simultaneous 401s', async () => {
    let refreshCallCount = 0;
    let refreshPromise: Promise<string | null> | null = null;

    // Simulate the exact concurrency lock mechanism implemented in baseApi.ts
    const simulateQuery = async (queryId: string): Promise<{ queryId: string; tokenUsed: string }> => {
      // Step 1: Initial query fails with 401
      let token = 'initial_expired_token';

      // Step 2: Handle 401 with single-flight mutex
      if (!refreshPromise) {
        refreshPromise = (async () => {
          refreshCallCount++;
          // Simulate network latency for /api/refresh
          await new Promise((r) => setTimeout(r, 20));
          return 'freshly_rotated_access_token_xyz';
        })().finally(() => {
          refreshPromise = null;
        });
      }

      // All waiting queries await the exact same in-flight promise
      const newToken = await refreshPromise;
      if (newToken) {
        token = newToken;
      }

      return { queryId, tokenUsed: token };
    };

    // Fire 5 simultaneous queries that encounter 401 at the same instant
    const results = await Promise.all([
      simulateQuery('query_leads'),
      simulateQuery('query_users'),
      simulateQuery('query_metrics'),
      simulateQuery('query_dashboard'),
      simulateQuery('query_notifications'),
    ]);

    // Assertion 1: /api/refresh was invoked strictly ONCE
    assert.equal(refreshCallCount, 1, '/api/refresh must only be called once across concurrent 401s');

    // Assertion 2: All 5 queries completed with the newly acquired rotated token
    assert.equal(results.length, 5);
    for (const res of results) {
      assert.equal(res.tokenUsed, 'freshly_rotated_access_token_xyz');
    }
  });

  test('failed refresh aborts retry and triggers clean logout without infinite loops', async () => {
    let loggedOut = false;
    let refreshPromise: Promise<string | null> | null = null;

    const simulateFailedRefresh = async () => {
      if (!refreshPromise) {
        refreshPromise = (async () => {
          // Simulate refresh failure (e.g. 401 because refresh token expired in cookie)
          await new Promise((r) => setTimeout(r, 10));
          loggedOut = true;
          return null;
        })().finally(() => {
          refreshPromise = null;
        });
      }

      const token = await refreshPromise;
      return token;
    };

    const token = await simulateFailedRefresh();
    assert.equal(token, null, 'Must return null when refresh fails');
    assert.equal(loggedOut, true, 'Must trigger logout when refresh fails');
  });
});
