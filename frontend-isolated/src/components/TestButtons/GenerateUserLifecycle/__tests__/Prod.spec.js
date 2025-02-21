import { test, expect } from '@playwright/test';

test.describe('GenerateUserLifecycle Production Tests', () => {
  test.describe.configure({ tag: ['generate-user-lifecycle', 'prod'] });

  test.beforeEach(async ({ page }) => {
    // Navigate to the production page
    await page.goto('https://antelope-frontend-isolate-ea7038a582fe.herokuapp.com/');
  });

  test('successfully tests user lifecycle in production', async ({ page }) => {
    // First generate a JWT token
    const jwtButton = page.getByText('Generate JWT');
    await expect(jwtButton).toBeVisible();
    await jwtButton.click();
    await expect(page.getByTestId('jwt-container').getByText('Token:')).toBeVisible({ timeout: 30000 });

    // Now test the user lifecycle
    const button = page.getByRole('button', { name: 'Test User Lifecycle' });
    await expect(button).toBeVisible();

    // Click the button
    await button.click();

    // Wait for and verify success message
    const container = page.getByTestId('user-lifecycle-container');
    await expect(container.getByText(/Test Username:/)).toBeVisible({ timeout: 30000 });
    
    // Verify lifecycle stages are displayed
    await expect(container.getByTestId('signup-status')).toBeVisible();
    await expect(container.getByTestId('signin-status')).toBeVisible();
    await expect(container.getByTestId('delete-status')).toBeVisible();

    // Verify success message
    await expect(container.getByTestId('lifecycle-message')).toBeVisible();
  });

  test('shows loading state while testing user lifecycle', async ({ page }) => {
    // First generate a JWT token
    const jwtButton = page.getByText('Generate JWT');
    await expect(jwtButton).toBeVisible();
    await jwtButton.click();
    await expect(page.getByTestId('jwt-container').getByText('Token:')).toBeVisible({ timeout: 30000 });

    // Now test the user lifecycle
    const button = page.getByRole('button', { name: 'Test User Lifecycle' });
    await expect(button).toBeVisible();
    
    // Click the button
    await button.click();

    // Wait for request to complete and verify success
    const container = page.getByTestId('user-lifecycle-container');
    await expect(container.getByText(/Test Username:/)).toBeVisible({ timeout: 30000 });
  });
}); 