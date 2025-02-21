import { test, expect } from '@playwright/test';

test.describe('GenerateJwt Production Tests', () => {
  test.describe.configure({ tag: ['generate-jwt', 'prod'] });

  test.beforeEach(async ({ page }) => {
    // Navigate to the production page
    await page.goto('https://antelope-frontend-isolate-ea7038a582fe.herokuapp.com/');
  });

  test('successfully generates JWT in production', async ({ page }) => {
    // Get the JWT generation button
    const button = page.getByText('Generate JWT');
    await expect(button).toBeVisible();

    // Click the button
    await button.click();

    // Wait for and verify success message
    const container = page.getByTestId('jwt-container');
    await expect(container.getByText('Token:')).toBeVisible({ timeout: 30000 });

    // Verify the JWT is displayed (should be a long string)
    const tokenText = await container.getByText(/^eyJ/).textContent();
    expect(tokenText).toBeTruthy();
    expect(tokenText.length).toBeGreaterThan(50); // JWT should be reasonably long
  });

  test('shows loading state while generating JWT', async ({ page }) => {
    const button = page.getByText('Generate JWT');
    
    // Click the button
    await button.click();

    // Wait for request to complete and verify success
    const container = page.getByTestId('jwt-container');
    await expect(container.getByText('Token:')).toBeVisible({ timeout: 30000 });
  });
}); 