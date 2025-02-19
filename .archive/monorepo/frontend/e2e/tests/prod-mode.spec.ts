import { test, expect } from '@playwright/test';

// Skip production tests in development mode
test.skip(process.env.NODE_ENV !== 'production', 'Production tests are skipped in development mode');

test('should verify production deployment is working', async ({ page }) => {
  const PROD_URL = 'https://antelope-integrated-app-fb8fae27deb5.herokuapp.com';
  
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

  // Navigate to production frontend
  await page.goto(PROD_URL);
  
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