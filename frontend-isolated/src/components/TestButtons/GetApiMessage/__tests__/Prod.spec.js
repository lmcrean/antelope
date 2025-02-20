import { test, expect } from '@playwright/test';

test.describe('GetApiMessage Production Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the production page
    await page.goto('https://antelope-frontend-isolate-ea7038a582fe.herokuapp.com/');
  });

  test('successfully fetches message from production API', async ({ page }) => {
    // Get the API health check button
    const button = page.getByTestId('api-message-button');
    await expect(button).toBeVisible();

    // Click the button
    await button.click();

    // Verify loading state
    await expect(button).toHaveText('Getting message...');

    // Wait for and verify success message
    const successMessage = page.getByTestId('api-message-status');
    await expect(successMessage).toBeVisible({ timeout: 30000 });

    // Verify the API response is displayed
    await expect(page.getByText('API Message:')).toBeVisible();
    await expect(page.getByText('✓')).toBeVisible();
  });

  test('shows loading state while fetching', async ({ page }) => {
    const button = page.getByTestId('api-message-button');
    
    // Click the button
    await button.click();

    // Verify loading state
    await expect(button).toHaveText('Getting message...');
    await expect(button).toHaveAttribute('aria-busy', 'true');

    // Wait for request to complete and verify success
    const successMessage = page.getByTestId('api-message-status');
    await expect(successMessage).toBeVisible({ timeout: 30000 });
  });

  test('handles API errors gracefully', async ({ page }) => {
    // Intercept the API request
    await page.route('**/api/test', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Internal Server Error' })
      });
    });
    
    const button = page.getByTestId('api-message-button');
    
    // Click the button and wait for loading state
    await button.click();
    await expect(button).toHaveText('Getting message...');
    
    // Wait for loading state to complete
    await expect(button).toHaveText('Get API Message', { timeout: 10000 });
    
    // Wait for error container to be present
    const errorContainer = page.locator('.bg-red-900\\/20');
    await expect(errorContainer).toBeVisible({ timeout: 10000 });
    
    // Verify error message
    const errorMessage = page.getByTestId('error-message');
    await expect(errorMessage).toBeVisible();
    await expect(page.getByText('✗')).toBeVisible();
  });
}); 