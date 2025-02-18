import { test, expect } from '@playwright/test';

test.describe('JWT Development Mode Tests', () => {
  test('should test JWT endpoint and verify token response', async ({ page }) => {
    // Start collecting network requests and responses
    const requests: string[] = [];
    const responses: { url: string; status: number }[] = [];

    // Monitor network requests and responses
    page.on('request', request => {
      const url = request.url();
      requests.push(url);
      console.log('Network request:', url);
    });

    page.on('response', async response => {
      const url = response.url();
      if (url.includes('/api/auth/test/')) {
        const responseBody = await response.json();
        console.log('JWT API Response:', JSON.stringify(responseBody, null, 2));
      }
      responses.push({
        url: url,
        status: response.status()
      });
      console.log('Network response:', url, response.status());
    });

    // Navigate to the application
    await page.goto('http://localhost:3001/');
    
    // Verify the JWT test button exists
    const jwtTestButton = page.getByTestId('jwt-test-button');
    await expect(jwtTestButton).toBeVisible();
    
    // Click the button and wait for the JWT test response
    const responsePromise = page.waitForResponse(response => 
      response.url().includes('/api/auth/test/') && response.status() === 200
    );
    await jwtTestButton.click();
    const jwtResponse = await responsePromise;
    
    // Wait for and verify the response in the UI
    const jwtStatus = await page.waitForSelector('[data-testid="jwt-status"]', { timeout: 10000 });
    const statusText = await jwtStatus.textContent();
    
    // Verify the response contains expected JWT information
    expect(statusText).toContain('JWT Test Result:');
    expect(statusText).toContain('Success: generated JWT token');
    expect(statusText).toContain('Success: token has service role permissions');
    expect(statusText).toContain('User: service_role');
    expect(statusText).toContain('Token:');

    // Verify the actual JWT response
    const responseBody = await jwtResponse.json();
    expect(responseBody).toHaveProperty('jwt');
    expect(responseBody).toHaveProperty('message');
    expect(responseBody).toHaveProperty('user');
    expect(responseBody.user).toBe('service_role');
    expect(Array.isArray(responseBody.message)).toBe(true);
    expect(responseBody.message).toHaveLength(2);
    expect(responseBody.message[0]).toBe('Success: generated JWT token');
    expect(responseBody.message[1]).toBe('Success: token has service role permissions');
    expect(typeof responseBody.jwt).toBe('string');
    expect(responseBody.jwt.split('.')).toHaveLength(3); // JWT should have 3 parts

    // Verify API requests and responses
    const apiRequests = requests.filter(url => url.includes('/api/auth/test/'));
    const apiResponses = responses.filter(r => r.url.includes('/api/auth/test/'));
    
    expect(apiRequests.length).toBe(1);
    expect(apiResponses.length).toBe(1);
    expect(apiResponses[0].status).toBe(200);
  });
});
