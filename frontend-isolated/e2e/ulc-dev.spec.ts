import { test, expect } from '@playwright/test';

test.describe('User Lifecycle Button E2E Tests', () => {
  test('should show some response after clicking button', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Find and click the button
    const ulcButton = page.getByTestId('user-lifecycle-button');
    await ulcButton.click();

    // Just wait for any kind of status to appear
    const statusContainer = page.getByTestId('user-lifecycle-status');
    await expect(statusContainer).toBeVisible({ timeout: 15000 });
  });

  test('should handle errors when network fails', async ({ page }) => {
    await page.goto('/');
    
    // Force a network error
    await page.route('**/api/auth/test/**', route => route.abort());

    // Click button and verify some error appears
    await page.getByTestId('user-lifecycle-button').click();
    await expect(page.getByTestId('error-message')).toBeVisible({ timeout: 15000 });
  });

  test('should verify successful user lifecycle completion', async ({ page }) => {
    // Enable request logging
    page.on('request', request => 
      console.log(`>> ${request.method()} ${request.url()}`));
    page.on('response', response => 
      console.log(`<< ${response.status()} ${response.url()}`));

    await page.goto('/');

    // Ensure successful API response
    await page.route('**/api/auth/test/**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: ['User lifecycle test completed'],
          user: 'test-user',
          userLifecycle: {
            created: 'test-user',
            signedIn: 'test-user',
            deleted: 'test-user'
          }
        })
      });
    });
    
    // Click the button
    await page.getByTestId('user-lifecycle-button').click();

    // Wait for status container
    const statusContainer = page.getByTestId('user-lifecycle-status');
    await expect(statusContainer).toBeVisible({ timeout: 15000 });

    // Verify the success messages appear in order
    await expect(statusContainer.getByText(/signed up with user/)).toBeVisible();
    await expect(statusContainer.getByText(/now signed in with user/)).toBeVisible();
    await expect(statusContainer.getByText(/deleted user/)).toBeVisible();

    // Verify final success state
    const container = page.getByTestId('user-lifecycle-container');
    await expect(container).toHaveClass(/bg-green-900\/20/);
  });
}); 