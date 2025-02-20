import { test, expect } from '@playwright/test';

test.describe('UserLifecycleButton Development Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the page containing the component
    await page.goto('/');
  });

  test('renders create test user button', async ({ page }) => {
    const button = page.getByRole('button', { name: 'Create Test User' });
    await expect(button).toBeVisible();
  });

  test('displays loading state while creating user', async ({ page }) => {
    const button = page.getByRole('button', { name: 'Create Test User' });
    
    // Intercept the API call and delay the response
    await page.route('/api/auth/create-user', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 100));
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          user: {
            id: 'test-id-123',
            email: 'test@example.com',
            status: 'active',
            created_at: '2024-02-20T12:00:00Z'
          },
          session: {
            id: 'session-id-123',
            expires_at: '2024-02-21T12:00:00Z'
          }
        })
      });
    });

    await button.click();
    await expect(button).toBeDisabled();
  });

  test('displays user data on successful creation', async ({ page }) => {
    const mockUserData = {
      user: {
        id: 'test-id-123',
        email: 'test@example.com',
        status: 'active',
        created_at: '2024-02-20T12:00:00Z'
      },
      session: {
        id: 'session-id-123',
        expires_at: '2024-02-21T12:00:00Z'
      }
    };

    // Intercept the API call
    await page.route('/api/auth/create-user', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify(mockUserData)
      });
    });

    const button = page.getByRole('button', { name: 'Create Test User' });
    await button.click();

    // Verify the displayed data
    await expect(page.getByText('User Created:')).toBeVisible();
    await expect(page.getByText('test-id-123')).toBeVisible();
    await expect(page.getByText('test@example.com')).toBeVisible();
    await expect(page.getByText('session-id-123')).toBeVisible();
  });

  test('displays error message on failed creation', async ({ page }) => {
    const errorMessage = 'Failed to create user';

    // Intercept the API call and return an error
    await page.route('/api/auth/create-user', route => {
      route.fulfill({
        status: 400,
        body: JSON.stringify({ message: errorMessage })
      });
    });

    const button = page.getByRole('button', { name: 'Create Test User' });
    await button.click();

    await expect(page.getByText(`Error: ${errorMessage}`)).toBeVisible();
  });

  test('handles network error gracefully', async ({ page }) => {
    // Intercept the API call and simulate a network error
    await page.route('/api/auth/create-user', route => {
      route.abort('failed');
    });

    const button = page.getByRole('button', { name: 'Create Test User' });
    await button.click();

    await expect(page.getByText('Error:')).toBeVisible();
  });
}); 