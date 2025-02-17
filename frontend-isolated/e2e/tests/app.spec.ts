import { test, expect } from '@playwright/test';

test.describe('App Health Check', () => {
  test('should load the main page', async ({ page }) => {
    await page.goto('/');
    
    // Verify Vite + React text is present
    await expect(page.getByText('Vite + React')).toBeVisible();
    
    // Verify the counter button is present and interactive
    const counterButton = page.getByText('count is', { exact: false });
    await expect(counterButton).toBeVisible();
    
    // Test counter interaction
    await counterButton.click();
    await expect(page.getByText('count is 1')).toBeVisible();
  });
}); 