import { test, expect } from '@playwright/test';

test.describe('GenerateJwt Development Tests', () => {
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
    
    // Check button is visible and enabled
    const button = page.getByText('Generate JWT');
    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();

    // Check that token and error are not visible initially
    const container = page.getByTestId('jwt-container');
    await expect(container.getByText('Token:')).not.toBeVisible();
    await expect(container.getByText(/Error:/)).not.toBeVisible();
  });

  test('should generate JWT successfully', async ({ page }) => {
    await page.goto('http://localhost:3001');
    
    // Mock the JWT generation response
    await page.route('**/api/auth/token/', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token'
        })
      });
    });

    // Click the button
    const button = page.getByText('Generate JWT');
    await button.click();

    // Verify token is displayed
    const container = page.getByTestId('jwt-container');
    await expect(container.getByText('Token:')).toBeVisible({ timeout: 10000 });
    await expect(container.getByText('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token')).toBeVisible({ timeout: 10000 });
  });

  test('should handle API errors gracefully', async ({ page }) => {
    await page.goto('http://localhost:3001');
    
    // Mock an API error response
    await page.route('**/api/auth/token/', route => 
      route.fulfill({ 
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ 
          message: 'Failed to generate JWT'
        })
      })
    );

    // Click the button
    const button = page.getByText('Generate JWT');
    await button.click();

    // Verify error is displayed
    const container = page.getByTestId('jwt-container');
    await expect(container.getByText(/Error:/)).toBeVisible({ timeout: 10000 });
    await expect(container.getByText('Failed to generate JWT')).toBeVisible({ timeout: 10000 });
  });

  test('should disable button during API call', async ({ page }) => {
    await page.goto('http://localhost:3001');
    
    // Mock a delayed API response
    await page.route('**/api/auth/token/', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Add delay
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token'
        })
      });
    });

    // Click the button
    const button = page.getByText('Generate JWT');
    await button.click();

    // Verify button is disabled during request
    await expect(button).toBeDisabled();

    // Wait for response and verify button is enabled again
    const container = page.getByTestId('jwt-container');
    await expect(container.getByText('Token:')).toBeVisible({ timeout: 10000 });
    await expect(button).toBeEnabled();
  });

  test('should clear previous results on new request', async ({ page }) => {
    await page.goto('http://localhost:3001');
    
    // First, generate a successful token
    await page.route('**/api/auth/token/', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.first.token'
        })
      });
    });

    const button = page.getByText('Generate JWT');
    await button.click();

    // Wait for first token to appear
    const container = page.getByTestId('jwt-container');
    await expect(container.getByText('first.token')).toBeVisible({ timeout: 10000 });

    // Now simulate an error on second request
    await page.route('**/api/auth/token/', route => 
      route.fulfill({ 
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ 
          message: 'Failed to generate JWT'
        })
      })
    );

    // Click again
    await button.click();

    // Verify previous token is gone and error is shown
    await expect(container.getByText('first.token')).not.toBeVisible({ timeout: 10000 });
    await expect(container.getByText(/Error:/)).toBeVisible({ timeout: 10000 });
  });
}); 