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

    // The endpoint should return an error (table doesn't exist) but with a proper HTTP response
    const statusBadge = locationsCard.locator('.status-badge.error');
    await expect(statusBadge).toBeVisible();
    await expect(statusBadge).toContainText('Error');

    // Verify error message is displayed
    const errorMessage = locationsCard.locator('.error-message');
    await expect(errorMessage).toBeVisible();

    // Should contain helpful error message about missing table
    const errorText = await errorMessage.textContent();
    expect(errorText).toMatch(/table|location|schema|exist/i);

    // Verify response details
    const responseDetails = locationsCard.locator('.response-details');
    await expect(responseDetails).toBeVisible();

    await responseDetails.locator('summary').click();
    const responseData = locationsCard.locator('.response-data');
    await expect(responseData).toBeVisible();

    // Verify JSON structure
    const jsonText = await responseData.textContent();
    expect(jsonText).toContain('"status": "error"');
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

    // Verify /db/status succeeded
    await expect(statusCard.locator('.status-badge.success')).toBeVisible();

    // Verify /db/locations returned error (expected behavior)
    await expect(locationsCard.locator('.status-badge.error')).toBeVisible();
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

  test('should call /db/locations directly and return 404', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/db/locations`);
    expect(response.status()).toBe(404);

    const data = await response.json();
    expect(data).toHaveProperty('status', 'error');
    expect(data).toHaveProperty('error');
    expect(data).toHaveProperty('database');
    expect(data).toHaveProperty('trace_id');

    // Verify error message mentions table/schema issue
    expect(data.error).toMatch(/table|location|schema|exist/i);

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
      `${API_BASE_URL}/db/locations?limit=10&offset=0&sort=created_at&order=desc`
    );

    // Should still return 404 (table doesn't exist)
    expect(response.status()).toBe(404);

    const data = await response.json();
    expect(data).toHaveProperty('status', 'error');
    expect(data).toHaveProperty('trace_id');
  });
});
