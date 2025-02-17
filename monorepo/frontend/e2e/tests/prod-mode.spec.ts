import { test, expect } from '@playwright/test';

test.describe('Production Mode Tests', () => {
  const PROD_FRONTEND_URL = 'https://antelope-frontend-isolate-ea7038a582fe.herokuapp.com';
  const PROD_API_URL = 'https://antelope-api-isolate-8beb50b26a2a.herokuapp.com';

  test('should verify production deployment is working', async ({ page }) => {
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
    await page.goto(PROD_FRONTEND_URL);
    
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
    
    // The response should be successful
    expect(statusText).toMatch(/API Status: healthy/);

    // Verify API requests and responses
    const apiRequests = requests.filter(url => url.includes('/health/'));
    const apiResponses = responses.filter(r => r.url.includes('/health/'));
    
    expect(apiRequests.length).toBe(1);
    expect(apiResponses.length).toBe(1);
    expect(apiResponses[0].status).toBe(200);
    
    // Print network activity for debugging
    console.log('API requests:', apiRequests);
    console.log('API responses:', apiResponses);
  });
}); 