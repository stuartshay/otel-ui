/**
 * API Service Integration Tests
 *
 * Tests for the API client service including:
 * - Health and demo endpoints
 * - Trace ID consistency
 * - CORS header validation
 * - Error handling
 *
 * NOTE: Database endpoint tests are in tests/database-endpoints.spec.ts
 */

import { test, expect } from '@playwright/test';

// Configuration from environment variables
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:8080';
const PRODUCTION_UI_ORIGIN =
  process.env.VITE_PRODUCTION_UI_ORIGIN || 'https://ui.lab.informationcart.com';

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

  // NOTE: Database endpoint tests are in tests/database-endpoints.spec.ts
  // to avoid duplication. See that file for comprehensive /db/status and /db/locations tests.

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
          Origin: PRODUCTION_UI_ORIGIN,
        },
      });

      expect(response.ok()).toBeTruthy();

      const headers = response.headers();
      expect(headers['access-control-allow-origin']).toBe(PRODUCTION_UI_ORIGIN);
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
