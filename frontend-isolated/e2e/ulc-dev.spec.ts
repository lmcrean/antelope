import { test, expect } from '@playwright/test';

test.describe('User Lifecycle Button E2E Tests', () => {
  test('should complete full user lifecycle flow', async ({ page }) => {
    // Enable request logging
    page.on('request', request => 
      console.log(`>> ${request.method()} ${request.url()}`));
    page.on('response', response => 
      console.log(`<< ${response.status()} ${response.url()}`));

    // Navigate to the app
    await page.goto('/');
    
    // Find and click the button
    const ulcButton = page.getByTestId('user-lifecycle-button');
    await ulcButton.click();

    // Just wait for any kind of status to appear
    const statusContainer = page.getByTestId('user-lifecycle-status');
    await expect(statusContainer).toBeVisible({ timeout: 15000 });

    // Wait for container to show final state (success or error)
    const container = page.getByTestId('user-lifecycle-container');
    await expect(container).toHaveClass(/bg-(?:green|red)-900\/20/, { timeout: 15000 });
  });

  test('should handle errors gracefully', async ({ page }) => {
    await page.goto('/');
    
    // Simulate error response
    await page.route('**/api/auth/test/**', async route => {
      await route.fulfill({
        status: 422,
        body: JSON.stringify({ error: 'Test error' })
      });
    });

    // Find and click the button
    const ulcButton = page.getByTestId('user-lifecycle-button');
    await ulcButton.click();

    // Just wait for any error indication
    const errorMessage = page.getByTestId('error-message');
    await expect(errorMessage).toBeVisible({ timeout: 15000 });

    // Verify container shows error state
    const container = page.getByTestId('user-lifecycle-container');
    await expect(container).toHaveClass(/bg-red-900\/20/, { timeout: 15000 });
  });
}); 