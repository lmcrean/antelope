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
    
    // Wait for the User Lifecycle button to be visible
    const ulcButton = page.getByTestId('user-lifecycle-button');
    await expect(ulcButton).toBeVisible();
    await expect(ulcButton).toHaveText('Sign Up');

    // Click the button to start the flow
    await ulcButton.click();

    // Wait for the button to be disabled (indicating loading state)
    await expect(ulcButton).toBeDisabled();

    // Wait for the status container to appear
    const statusContainer = page.getByTestId('user-lifecycle-status');
    await expect(statusContainer).toBeVisible({ timeout: 10000 });

    // Wait for signup success message in the status container
    const signupMessage = statusContainer.getByText(/signed up with user/);
    await expect(signupMessage).toBeVisible({ timeout: 10000 });

    // Wait for signin success message in the status container
    const signinMessage = statusContainer.getByText(/now signed in with user/);
    await expect(signinMessage).toBeVisible({ timeout: 5000 });

    // Wait for delete success message in the status container
    const deleteMessage = statusContainer.getByText(/deleted user/);
    await expect(deleteMessage).toBeVisible({ timeout: 5000 });

    // Verify the container has turned green to indicate success
    await expect(page.getByTestId('user-lifecycle-container')).toHaveClass(/bg-green-900\/20/);

    // Verify final state - button should return to initial state
    await expect(ulcButton).toBeEnabled();
    await expect(ulcButton).toHaveText('Sign Up');
  });

  test('should handle errors gracefully', async ({ page }) => {
    await page.goto('/');
    
    // Simulate network error by intercepting requests
    await page.route('**/api/auth/test/**', async route => {
      await route.abort('failed');
    });

    const ulcButton = page.getByTestId('user-lifecycle-button');
    await expect(ulcButton).toBeVisible();
    await expect(ulcButton).toHaveText('Sign Up');
    await ulcButton.click();

    // Wait for the button to be disabled (indicating loading state)
    await expect(ulcButton).toBeDisabled();

    // Wait for the status container to appear
    const statusContainer = page.getByTestId('user-lifecycle-status');
    await expect(statusContainer).toBeVisible({ timeout: 5000 });

    // Verify error message appears
    const errorMessage = page.getByTestId('error-message');
    await expect(errorMessage).toBeVisible();
    
    // Verify the container has turned red to indicate error
    await expect(page.getByTestId('user-lifecycle-container')).toHaveClass(/bg-red-900\/20/);

    // Verify button returns to initial state
    await expect(ulcButton).toBeEnabled();
    await expect(ulcButton).toHaveText('Sign Up');
  });
}); 