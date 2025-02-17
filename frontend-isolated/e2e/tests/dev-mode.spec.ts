import { test, expect } from '@playwright/test';

test.describe('Development Mode Tests', () => {
  test('should check API health and verify console logs', async ({ page }) => {
    // Start collecting console logs and network requests
    const logs: { type: string; text: string }[] = [];
    const requests: string[] = [];

    page.on('console', (msg) => {
      logs.push({
        type: msg.type(),
        text: msg.text()
      });
      // Print logs for debugging
      console.log(`Browser log (${msg.type()}):`, msg.text());
    });

    // Monitor network requests
    page.on('request', request => {
      const url = request.url();
      requests.push(url);
      console.log('Network request:', url);
    });

    await page.goto('/');
    
    // Verify the health check button exists
    const healthCheckButton = page.getByRole('button', { name: 'Check API Health' });
    await expect(healthCheckButton).toBeVisible();
    
    // Click the button and wait for network idle
    await Promise.all([
      page.waitForLoadState('networkidle'),
      healthCheckButton.click()
    ]);
    
    // Verify loading state
    await expect(page.getByText('Checking API health...')).toBeVisible();
    
    // Wait for and verify the response
    const healthStatus = await page.waitForSelector('[data-testid="health-status"]');
    const statusText = await healthStatus.textContent();
    
    // The response should be successful
    expect(statusText).toMatch(/API Status: healthy/);

    // Wait a bit for all logs to be collected
    await page.waitForTimeout(1000);

    // Verify API requests
    const apiRequests = requests.filter(url => url.includes('/health/'));
    expect(apiRequests.length).toBeGreaterThan(0);
    
    // Verify console logs - look for any network or API-related logs
    const apiCallLogs = logs.filter(log => 
      log.text.toLowerCase().includes('http') || 
      log.text.toLowerCase().includes('api') ||
      log.text.toLowerCase().includes('health')
    );
    
    console.log('All collected logs:', logs);
    console.log('Filtered API logs:', apiCallLogs);
    console.log('API requests:', apiRequests);
    
    expect(apiCallLogs.length).toBeGreaterThan(0);
    
    // If there are any error logs, print them for debugging
    const errorLogs = logs.filter(log => log.type === 'error');
    if (errorLogs.length > 0) {
      console.log('Error logs found:', errorLogs);
    }
  });
}); 