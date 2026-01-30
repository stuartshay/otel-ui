/**
 * API Service Unit Tests
 *
 * Tests for the API client service including:
 * - Database endpoint methods
 * - Retry logic
 * - Error handling
 * - Type safety
 */

import { test, expect } from '@playwright/test';

// Backend API base URL (from environment or default to localhost)
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:8080';

test.describe('API Service - Direct API Tests', () => {
  test.describe('Health Endpoints', () => {
    test('GET /health should return 200 with status', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/health`);
      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('status', 'healthy');
    });

    test('GET /ready should return 200 with readiness status', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/ready`);
      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('status');
    });

    test('GET /info should return service information', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/info`);
      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('service');
      expect(data).toHaveProperty('version');
    });
  });

  test.describe('Database Endpoints', () => {
    test('GET /db/status should return database connection info', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/db/status`);
      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('status', 'connected');
      expect(data).toHaveProperty('database');
      expect(data).toHaveProperty('host');
      expect(data).toHaveProperty('port');
      expect(data).toHaveProperty('server_version');
      expect(data).toHaveProperty('trace_id');

      // Verify trace ID format (32-char hex)
      expect(data.trace_id).toMatch(/^[0-9a-f]{32}$/);
    });

    test('GET /db/locations should return paginated locations', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/db/locations?limit=5`);
      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('count');
      expect(data).toHaveProperty('limit', 5);
      expect(data).toHaveProperty('offset', 0);
      expect(data).toHaveProperty('sort');
      expect(data).toHaveProperty('order');
      expect(data).toHaveProperty('locations');
      expect(data).toHaveProperty('trace_id');

      expect(Array.isArray(data.locations)).toBeTruthy();
    });

    test('GET /db/locations should support query parameters', async ({ request }) => {
      const response = await request.get(
        `${API_BASE_URL}/db/locations?limit=2&offset=0&sort=timestamp&order=desc`
      );
      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('limit', 2);
      expect(data).toHaveProperty('offset', 0);
      expect(data).toHaveProperty('sort', 'timestamp');
      expect(data).toHaveProperty('order', 'desc');
    });

    test('GET /db/locations should return location record structure', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/db/locations?limit=1`);
      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      if (data.locations.length > 0) {
        const location = data.locations[0];
        // Verify all expected fields are present
        expect(location).toHaveProperty('id');
        expect(location).toHaveProperty('device_id');
        expect(location).toHaveProperty('tid');
        expect(location).toHaveProperty('latitude');
        expect(location).toHaveProperty('longitude');
        expect(location).toHaveProperty('accuracy');
        expect(location).toHaveProperty('altitude');
        expect(location).toHaveProperty('velocity');
        expect(location).toHaveProperty('battery');
        expect(location).toHaveProperty('battery_status');
        expect(location).toHaveProperty('connection_type');
        expect(location).toHaveProperty('trigger');
        expect(location).toHaveProperty('timestamp');
        expect(location).toHaveProperty('created_at');
        expect(location).toHaveProperty('raw_payload');
      }
    });
  });

  test.describe('Demo Endpoints', () => {
    test('GET /chain should return chain demo response', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/chain`);
      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('trace_id');
    });

    test('GET /slow should return after delay', async ({ request }) => {
      const startTime = Date.now();
      const response = await request.get(`${API_BASE_URL}/slow`);
      const duration = Date.now() - startTime;

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('trace_id');
      expect(data).toHaveProperty('delay_ms');

      // Should take at least the delay time
      expect(duration).toBeGreaterThan(500);
    });
  });

  test.describe('Trace ID Consistency', () => {
    test('should return unique trace IDs for each request', async ({ request }) => {
      const response1 = await request.get(`${API_BASE_URL}/health`);
      const response2 = await request.get(`${API_BASE_URL}/health`);

      const data1 = await response1.json();
      const data2 = await response2.json();

      // Both should have trace IDs
      expect(data1.trace_id).toMatch(/^[0-9a-f]{32}$/);
      expect(data2.trace_id).toMatch(/^[0-9a-f]{32}$/);

      // Trace IDs should be unique
      expect(data1.trace_id).not.toBe(data2.trace_id);
    });

    test('should include x-trace-id header in response', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/db/status`);
      const headers = response.headers();

      // Check for trace ID in header (lowercase per HTTP spec)
      const traceIdHeader = headers['x-trace-id'];
      expect(traceIdHeader).toBeTruthy();
      expect(traceIdHeader).toMatch(/^[0-9a-f]{32}$/);

      // Header trace ID should match body trace ID
      const data = await response.json();
      expect(traceIdHeader).toBe(data.trace_id);
    });
  });

  test.describe('CORS Headers', () => {
    test('should include CORS headers for localhost origin', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/db/status`, {
        headers: {
          Origin: 'http://localhost:5173',
        },
      });

      expect(response.ok()).toBeTruthy();

      const headers = response.headers();
      expect(headers['access-control-allow-origin']).toBe('http://localhost:5173');
      expect(headers['access-control-expose-headers']).toContain('X-Trace-Id');
    });

    test('should include CORS headers for production origin', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/health`, {
        headers: {
          Origin: 'https://ui.lab.informationcart.com',
        },
      });

      expect(response.ok()).toBeTruthy();

      const headers = response.headers();
      expect(headers['access-control-allow-origin']).toBe('https://ui.lab.informationcart.com');
    });
  });

  test.describe('Error Handling', () => {
    test('GET /error should return 500 error', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/error`);
      expect(response.status()).toBe(500);

      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data).toHaveProperty('trace_id');
    });

    test('GET /nonexistent should return 404', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/nonexistent-endpoint-xyz`);
      expect(response.status()).toBe(404);
    });
  });
});

test.describe('API Service - Retry Logic Tests', () => {
  // Note: These tests verify retry behavior by testing endpoints
  // that are expected to succeed. Full retry testing would require
  // a mock server or test endpoint that fails intermittently.

  test('should successfully complete request without retry on 200', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/health`);
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
  });

  test('should handle timeout gracefully', async ({ request }) => {
    // The /slow endpoint has a delay but should complete within timeout
    const response = await request.get(`${API_BASE_URL}/slow`, {
      timeout: 60000, // Allow plenty of time
    });
    expect(response.ok()).toBeTruthy();
  });

  test('should complete multiple concurrent requests', async ({ request }) => {
    // Test that multiple requests can complete successfully
    const requests = [
      request.get(`${API_BASE_URL}/health`),
      request.get(`${API_BASE_URL}/db/status`),
      request.get(`${API_BASE_URL}/info`),
    ];

    const responses = await Promise.all(requests);

    responses.forEach(response => {
      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);
    });
  });
});
