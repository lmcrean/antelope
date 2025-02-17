import { test, expect } from '@playwright/test';

test.describe('Development Mode Tests', () => {
  test('should check API health and verify console logs', async ({ page }) => {
    // Start collecting console logs
    const logs: { type: string; text: string }[] = [];
    page.on('console', (msg) => {
      logs.push({
        type: msg.type(),
        text: msg.text()
      });
    });

    await page.goto('/');
    
    // Verify the health check button exists
    const healthCheckButton = page.getByRole('button', { name: 'Check API Health' });
    await expect(healthCheckButton).toBeVisible();
    
    // Click the button and verify loading state
    await healthCheckButton.click();
    await expect(page.getByText('Checking API health...')).toBeVisible();
    
    // Wait for and verify the response
    const healthStatus = await page.waitForSelector('[data-testid="health-status"]');
    const statusText = await healthStatus.textContent();
    
    // The response should either be success or error
    expect(statusText).toMatch(/API Status: (healthy|unhealthy)/);

    // the reponse should be successful
    expect(statusText).toMatch(/API Status: healthy/);

    // Verify console logs
    const apiCallLogs = logs.filter(log => 
      log.text.includes('http://localhost:8000/api/health/') || 
      log.text.includes('API Status')
    );
    
    expect(apiCallLogs.length).toBeGreaterThan(0);
    
    // If there are any error logs, print them for debugging
    const errorLogs = logs.filter(log => log.type === 'error');
    if (errorLogs.length > 0) {
      console.log('Error logs found:', errorLogs);
    }
  });
}); 