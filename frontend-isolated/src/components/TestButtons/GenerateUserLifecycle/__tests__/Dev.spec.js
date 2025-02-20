import { test, expect } from '@playwright/test';

test.describe('UserLifecycleButton Development Tests', () => {
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

  test('should display initial state correctly', async ({ page }) => {
    await page.goto('http://localhost:3001');
    const container = await page.getByTestId('user-lifecycle-container');
    await expect(container).toBeVisible();
    const button = container.getByRole('button', { name: 'Test User Lifecycle' });
    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();
    await expect(page.getByTestId('test-username')).not.toBeVisible();
    await expect(page.getByTestId('error-message')).not.toBeVisible();
  });

  test('should create user and display lifecycle data successfully', async ({ page }) => {
    await page.goto('http://localhost:3001');
    
    // Mock the API response
    await page.route('**/api/auth/test-user-lifecycle', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'User lifecycle test completed successfully',
          details: {
            signup: 'Success',
            signin: 'Success',
            delete: 'Success'
          }
        })
      });
    });

    const button = page.getByRole('button', { name: 'Test User Lifecycle' });
    await button.click();

    await expect(page.getByTestId('test-username')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('lifecycle-message')).toBeVisible();
    await expect(page.getByTestId('signup-status')).toBeVisible();
    await expect(page.getByTestId('signin-status')).toBeVisible();
    await expect(page.getByTestId('delete-status')).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    await page.goto('http://localhost:3001');
    
    // Mock an API error
    await page.route('**/api/auth/test-user-lifecycle', route => 
      route.fulfill({ 
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Failed to complete user lifecycle test' })
      })
    );
    
    const button = page.getByRole('button', { name: 'Test User Lifecycle' });
    await button.click();

    await expect(page.getByTestId('error-message')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Failed to complete user lifecycle test')).toBeVisible();
  });

  test('should disable button during API call', async ({ page }) => {
    await page.goto('http://localhost:3001');
    
    // Mock a delayed API response
    await page.route('**/api/auth/test-user-lifecycle', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'User lifecycle test completed successfully',
          details: {
            signup: 'Success',
            signin: 'Success',
            delete: 'Success'
          }
        })
      });
    });

    const button = page.getByRole('button', { name: 'Test User Lifecycle' });
    await button.click();
    
    // Button should be disabled while request is in flight
    await expect(button).toBeDisabled();
    
    // Wait for request to complete
    await expect(page.getByTestId('test-username')).toBeVisible({ timeout: 10000 });
    
    // Button should be enabled again
    await expect(button).toBeEnabled();
  });
}); 