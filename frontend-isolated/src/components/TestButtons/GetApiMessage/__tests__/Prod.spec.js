import { test, expect } from '@playwright/test';

test.describe('GetApiMessage Production Tests', () => {
  test.describe.configure({ tag: ['get-api-message', 'prod'] });

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


}); 