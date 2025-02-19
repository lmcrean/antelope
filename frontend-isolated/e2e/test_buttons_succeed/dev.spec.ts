import { test, expect } from '@playwright/test';

test.describe('All Buttons E2E Tests', () => {
  test('should verify all buttons work correctly', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Test API Health Button
    const apiHealthButton = page.getByTestId('api-health-button');
    await apiHealthButton.click();
    await page.waitForLoadState('networkidle');
    const apiHealthContainer = page.getByTestId('api-health-container');
    await expect(apiHealthContainer).toHaveClass(/bg-green-900\/20/, { timeout: 15000 });
    
    // Test JWT Button
    const jwtButton = page.getByTestId('jwt-test-button');
    await jwtButton.click();
    await page.waitForLoadState('networkidle');
    const jwtContainer = page.getByTestId('jwt-test-container');
    await expect(jwtContainer).toHaveClass(/bg-green-900\/20/, { timeout: 15000 });
    
    // Test User Lifecycle Button
    const ulcButton = page.getByTestId('user-lifecycle-button');
    await ulcButton.click();
    await page.waitForLoadState('networkidle');
    const ulcContainer = page.getByTestId('user-lifecycle-container');
    await expect(ulcContainer).toHaveClass(/bg-green-900\/20/, { timeout: 15000 });
  });
}); 