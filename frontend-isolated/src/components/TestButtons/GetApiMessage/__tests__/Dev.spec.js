import { test, expect } from '@playwright/test';

test.describe('GetApiMessage Development Tests', () => {
  test('should have frontend and API connection working', async ({ page }) => {
    // Test the frontend is running
    await page.goto('http://localhost:3001');
    await expect(page).toHaveTitle(/Vite \+ React/);

    // Test the API is accessible through the proxy
    const apiResponse = await page.request.get('http://localhost:3001/api/test/');
    expect(apiResponse.ok()).toBeTruthy();
    const data = await apiResponse.json();
    expect(data).toHaveProperty('message');
    expect(data.message).toBe('API is working!');
  });

  test('GetApiMessage button should work with development API', async ({ page }) => {
    await page.goto('http://localhost:3001');
    
    // Click the GetApiMessage button
    const button = page.getByTestId('api-message-button');
    await button.click();

    // Wait for and verify the response
    await expect(page.getByTestId('api-message-status')).toBeVisible();
    const responseText = await page.getByTestId('api-message-status').textContent();
    expect(responseText).toContain('API Message:');
    expect(responseText).toContain('API is working!');
  });
}); 