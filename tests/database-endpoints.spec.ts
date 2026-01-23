/**
 * Database Endpoints Tests
 *
 * Tests for /db/status and /db/locations endpoints via the OTel Testing page.
 * Validates that both database endpoints are accessible and return expected responses.
 */

import { test, expect } from '@playwright/test';

// Backend API base URL (from environment or default to localhost)
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:8080';

test.describe.skip('Database Endpoints - UI Tests (requires auth)', () => {
  // Note: These tests require Cognito authentication
  // Run with proper auth setup or use Direct API Tests below

  test.beforeEach(async ({ page }) => {
    // Navigate to the testing page
    // Note: This requires authentication via Cognito
    await page.goto('http://localhost:5173/testing');

    // Wait for page to be fully loaded
    await expect(page.locator('h2:has-text("OpenTelemetry API Testing")')).toBeVisible();
  });

  test('should test /db/status endpoint via UI', async ({ page }) => {
    // Find and click the Database Status test button
    const statusCard = page.locator('.endpoint-card').filter({ hasText: 'Database Status' });
    await expect(statusCard).toBeVisible();

    const testButton = statusCard.locator('button:has-text("Test Endpoint")');
    await testButton.click();

    // Wait for the result to appear
    await expect(statusCard.locator('.result-section')).toBeVisible({ timeout: 10000 });

    // Check for success status
    const statusBadge = statusCard.locator('.status-badge.success');
    await expect(statusBadge).toBeVisible();
    await expect(statusBadge).toContainText('Success');

    // Verify response data is displayed
    const responseDetails = statusCard.locator('.response-details');
    await expect(responseDetails).toBeVisible();

    // Check that response contains expected fields
    await responseDetails.locator('summary').click();
    const responseData = statusCard.locator('.response-data');
    await expect(responseData).toBeVisible();

    // Verify JSON structure
    const jsonText = await responseData.textContent();
    expect(jsonText).toContain('"status": "connected"');
    expect(jsonText).toContain('"database"');
    expect(jsonText).toContain('"host"');
    expect(jsonText).toContain('"port"');
    expect(jsonText).toContain('"trace_id"');
  });

  test('should test /db/locations endpoint via UI', async ({ page }) => {
    // Find and click the Database Locations test button
    const locationsCard = page.locator('.endpoint-card').filter({ hasText: 'Database Locations' });
    await expect(locationsCard).toBeVisible();

    const testButton = locationsCard.locator('button:has-text("Test Endpoint")');
    await testButton.click();

    // Wait for the result to appear
    await expect(locationsCard.locator('.result-section')).toBeVisible({ timeout: 10000 });

    // The endpoint should now return success with owntracks database
    const statusBadge = locationsCard.locator('.status-badge.success');
    await expect(statusBadge).toBeVisible();
    await expect(statusBadge).toContainText('Success');

    // Verify response details
    const responseDetails = locationsCard.locator('.response-details');
    await expect(responseDetails).toBeVisible();

    await responseDetails.locator('summary').click();
    const responseData = locationsCard.locator('.response-data');
    await expect(responseData).toBeVisible();

    // Verify JSON structure contains locations array
    const jsonText = await responseData.textContent();
    expect(jsonText).toContain('"locations"');
    expect(jsonText).toContain('"count"');
    expect(jsonText).toContain('"limit"');
    expect(jsonText).toContain('"trace_id"');
  });

  test('should display trace IDs for both database endpoints', async ({ page }) => {
    // Test /db/status
    const statusCard = page.locator('.endpoint-card').filter({ hasText: 'Database Status' });
    await statusCard.locator('button:has-text("Test Endpoint")').click();
    await expect(statusCard.locator('.result-section')).toBeVisible({ timeout: 10000 });

    // Check for trace ID
    const statusTraceId = statusCard.locator('.trace-id .trace-value');
    await expect(statusTraceId).toBeVisible();
    const statusTraceText = await statusTraceId.textContent();
    expect(statusTraceText).toMatch(/^[0-9a-f]{32}$/); // 32-char hex string

    // Test /db/locations
    const locationsCard = page.locator('.endpoint-card').filter({ hasText: 'Database Locations' });
    await locationsCard.locator('button:has-text("Test Endpoint")').click();
    await expect(locationsCard.locator('.result-section')).toBeVisible({ timeout: 10000 });

    // Check for trace ID (should be present even for errors)
    const locationsTraceId = locationsCard.locator('.trace-id .trace-value');
    await expect(locationsTraceId).toBeVisible();
    const locationsTraceText = await locationsTraceId.textContent();
    expect(locationsTraceText).toMatch(/^[0-9a-f]{32}$/);

    // Trace IDs should be different
    expect(statusTraceText).not.toBe(locationsTraceText);
  });

  test('should test all endpoints including database endpoints', async ({ page }) => {
    // Click "Test All Endpoints" button
    const testAllButton = page.locator('button:has-text("Test All Endpoints")');
    await testAllButton.click();

    // Wait for all endpoint cards to show results
    await page.waitForTimeout(5000); // Give time for all requests to complete

    // Check that both database endpoints were tested
    const statusCard = page.locator('.endpoint-card').filter({ hasText: 'Database Status' });
    await expect(statusCard.locator('.result-section')).toBeVisible();

    const locationsCard = page.locator('.endpoint-card').filter({ hasText: 'Database Locations' });
    await expect(locationsCard.locator('.result-section')).toBeVisible();

    // Verify both endpoints succeeded
    await expect(statusCard.locator('.status-badge.success')).toBeVisible();
    await expect(locationsCard.locator('.status-badge.success')).toBeVisible();
  });

  test('should show response timing for database endpoints', async ({ page }) => {
    // Test /db/status
    const statusCard = page.locator('.endpoint-card').filter({ hasText: 'Database Status' });
    await statusCard.locator('button:has-text("Test Endpoint")').click();
    await expect(statusCard.locator('.result-section')).toBeVisible({ timeout: 10000 });

    // Check duration badge
    const durationBadge = statusCard.locator('.duration-badge');
    await expect(durationBadge).toBeVisible();
    const durationText = await durationBadge.textContent();
    expect(durationText).toMatch(/^\d+ms$/); // e.g., "123ms"
  });
});

test.describe('Database Endpoints - Direct API Tests', () => {
  test('should call /db/status directly and return 200', async ({ request }) => {
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

  test('should call /db/locations directly and return 200', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/db/locations?limit=2`);
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('count');
    expect(data).toHaveProperty('limit', 2);
    expect(data).toHaveProperty('offset', 0);
    expect(data).toHaveProperty('sort');
    expect(data).toHaveProperty('order');
    expect(data).toHaveProperty('locations');
    expect(data).toHaveProperty('trace_id');

    // Verify locations array structure
    expect(Array.isArray(data.locations)).toBeTruthy();
    if (data.locations.length > 0) {
      const location = data.locations[0];
      // Verify all 15 fields are present
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

    // Verify trace ID format
    expect(data.trace_id).toMatch(/^[0-9a-f]{32}$/);
  });

  test('should verify CORS headers are present', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/db/status`, {
      headers: {
        Origin: 'http://localhost:5173',
      },
    });

    expect(response.ok()).toBeTruthy();

    // Check CORS headers
    const headers = response.headers();
    expect(headers['access-control-allow-origin']).toBe('http://localhost:5173');
    expect(headers['access-control-expose-headers']).toContain('X-Trace-Id');
  });

  test('should verify trace IDs are unique across requests', async ({ request }) => {
    // Make multiple requests
    const response1 = await request.get(`${API_BASE_URL}/db/status`);
    const response2 = await request.get(`${API_BASE_URL}/db/status`);

    const data1 = await response1.json();
    const data2 = await response2.json();

    // Trace IDs should be different
    expect(data1.trace_id).not.toBe(data2.trace_id);
  });

  test('should test /db/locations with query parameters', async ({ request }) => {
    const response = await request.get(
      `${API_BASE_URL}/db/locations?limit=5&offset=0&sort=timestamp&order=desc`
    );

    // Should return 200 with owntracks database
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('count');
    expect(data).toHaveProperty('limit', 5);
    expect(data).toHaveProperty('offset', 0);
    expect(data).toHaveProperty('sort', 'timestamp');
    expect(data).toHaveProperty('order', 'desc');
    expect(data).toHaveProperty('locations');
    expect(data).toHaveProperty('trace_id');
    expect(Array.isArray(data.locations)).toBeTruthy();
  });
});
