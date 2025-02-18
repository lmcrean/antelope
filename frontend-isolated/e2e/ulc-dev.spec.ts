import { test, expect } from '@playwright/test';

test.describe('User Lifecycle Button E2E Tests', () => {
  test('should complete full user lifecycle flow', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the User Lifecycle button to be visible
    const ulcButton = page.getByTestId('user-lifecycle-button');
    await expect(ulcButton).toBeVisible();

    // Click the button to start the flow
    await ulcButton.click();

    // Wait for signup success message
    const signupMessage = page.getByText('User created successfully');
    await expect(signupMessage).toBeVisible({ timeout: 10000 });

    // Wait for signin success message
    const signinMessage = page.getByText('User signed in successfully');
    await expect(signinMessage).toBeVisible({ timeout: 5000 });

    // Wait for delete success message
    const deleteMessage = page.getByText('User deleted successfully');
    await expect(deleteMessage).toBeVisible({ timeout: 5000 });

    // Verify final state
    const finalMessage = page.getByText('User lifecycle test completed successfully');
    await expect(finalMessage).toBeVisible();
  });

  test('should handle errors gracefully', async ({ page }) => {
    await page.goto('/');
    
    // Simulate network error by intercepting requests
    await page.route('**/api/auth/**', async route => {
      await route.abort('failed');
    });

    const ulcButton = page.getByTestId('user-lifecycle-button');
    await ulcButton.click();

    // Verify error message appears
    const errorMessage = page.getByText(/error/i);
    await expect(errorMessage).toBeVisible();
  });
}); 