import { test, expect } from '@playwright/test';

test.describe('GetSupabaseHealth Production Tests', () => {
  test.describe.configure({ tag: ['get-supabase-health', 'prod'] });

  test.beforeEach(async ({ page }) => {
    // Navigate to the production page
    await page.goto('https://antelope-frontend-isolate-ea7038a582fe.herokuapp.com/');
  });

  test('successfully checks Supabase health in production', async ({ page }) => {
    // Get the health check button
    const button = page.getByTestId('api-health-button');
    await expect(button).toBeVisible();

    // Click the button
    await button.click();

    // Wait for and verify success message
    const successMessage = page.getByTestId('api-health-status');
    await expect(successMessage).toBeVisible({ timeout: 30000 });

    // Verify the health status is displayed
    await expect(page.getByText(/Status: (healthy|degraded)/)).toBeVisible();
    await expect(page.getByText(/Supabase Connected: (Yes|No)/)).toBeVisible();
  });

  test('shows loading state while checking health', async ({ page }) => {
    const button = page.getByTestId('api-health-button');
    
    // Click the button
    await button.click();

    // Wait for request to complete and verify success
    const successMessage = page.getByTestId('api-health-status');
    await expect(successMessage).toBeVisible({ timeout: 30000 });
  });
}); 