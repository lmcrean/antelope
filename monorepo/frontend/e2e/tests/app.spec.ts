import { test, expect } from '@playwright/test';

test.describe('App Health Check', () => {
  test('should load the main page', async ({ page }) => {
    await page.goto('/');
    
    // Verify Vite + React text is present
    await expect(page.getByText('Vite + React')).toBeVisible();
    
    // Verify the counter button is present and interactive
    const counterButton = page.getByText('count is', { exact: false });
    await expect(counterButton).toBeVisible();
    
    // Test counter interaction
    await counterButton.click();
    await expect(page.getByText('count is 1')).toBeVisible();
  });

  test('should check API health status', async ({ page }) => {
    await page.goto('/');
    
    // Verify API health check button exists
    const healthCheckButton = page.getByRole('button', { name: 'Check API Health' });
    await expect(healthCheckButton).toBeVisible();
    
    // Click the button and verify loading state
    await healthCheckButton.click();
    await expect(page.getByText('Checking API health...')).toBeVisible();
    
    // Wait for and verify the response
    const healthStatus = await page.waitForSelector('[data-testid="health-status"]');
    const statusText = await healthStatus.textContent();
    
    // The response should either be success or error
    expect(statusText).toMatch(/API Status: (healthy|unhealthy)/);
  });
}); 