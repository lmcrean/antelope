import { test, expect } from '@playwright/test';

test('should check API health and verify network activity', async ({ page }) => {
  // Start collecting network requests and responses
  const requests: string[] = [];
  const responses: { url: string; status: number }[] = [];

  // Monitor network requests and responses
  page.on('request', request => {
    const url = request.url();
    requests.push(url);
    console.log('Network request:', url);
  });

  page.on('response', response => {
    responses.push({
      url: response.url(),
      status: response.status()
    });
    console.log('Network response:', response.url(), response.status());
  });

  // Navigate to frontend
  await page.goto('/');
  
  // Verify the page loaded correctly
  await expect(page.getByText('Vite + React')).toBeVisible();
  
  // Verify the health check button exists
  const healthCheckButton = page.getByRole('button', { name: 'Check API Health' });
  await expect(healthCheckButton).toBeVisible();
  
  // Click the button and wait for the health check response
  const responsePromise = page.waitForResponse(response => 
    response.url().includes('/health/') && response.status() === 200
  );
  await healthCheckButton.click();
  const healthResponse = await responsePromise;
  
  // Wait for and verify the response in the UI
  const healthStatus = await page.waitForSelector('[data-testid="health-status"]', { timeout: 10000 });
  const statusText = await healthStatus.textContent();
  
  // Verify the response
  expect(statusText).toMatch(/API Status: (healthy|unhealthy)/);
  
  // Verify we captured network activity
  expect(requests.length).toBeGreaterThan(0);
  expect(responses.length).toBeGreaterThan(0);
  
  // Verify health check response
  expect(healthResponse.status()).toBe(200);
}); 