import { test, expect } from '@playwright/test';

test.describe('JWT and User Management Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3001/');
  });

  test('should verify JWT token generation', async ({ page }) => {
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
      if (url.includes('/api/auth/')) {
        const responseBody = await response.json();
        console.log('Auth API Response:', JSON.stringify(responseBody, null, 2));
      }
      responses.push({
        url: url,
        status: response.status()
      });
      console.log('Network response:', url, response.status());
    });

    // Verify JWT token generation
    const jwtTestButton = page.getByTestId('jwt-test-button');
    await expect(jwtTestButton).toBeVisible();
    
    const responsePromise = page.waitForResponse(response => 
      response.url().includes('/api/auth/test/') && response.status() === 200
    );
    await jwtTestButton.click();
    const jwtResponse = await responsePromise;
    
    const jwtStatus = await page.waitForSelector('[data-testid="jwt-status"]', { timeout: 10000 });
    const statusText = await jwtStatus.textContent();
    
    // Verify JWT response content
    expect(statusText).toContain('JWT Test Result:');
    expect(statusText).toContain('Success: generated JWT token');
    expect(statusText).toContain('Success: token has service role permissions');
    expect(statusText).toContain('User: service_role');
    expect(statusText).toContain('Token:');

    const jwtResponseBody = await jwtResponse.json();
    expect(jwtResponseBody).toHaveProperty('jwt');
    expect(jwtResponseBody).toHaveProperty('message');
    expect(jwtResponseBody).toHaveProperty('user');
    expect(jwtResponseBody.user).toBe('service_role');
    expect(Array.isArray(jwtResponseBody.message)).toBe(true);
    expect(jwtResponseBody.message).toHaveLength(2);
    expect(jwtResponseBody.message[0]).toBe('Success: generated JWT token');
    expect(jwtResponseBody.message[1]).toBe('Success: token has service role permissions');
    expect(typeof jwtResponseBody.jwt).toBe('string');
    expect(jwtResponseBody.jwt.split('.')).toHaveLength(3);

    // Verify network activity
    const jwtRequests = requests.filter(url => url.includes('/api/auth/test/'));
    const jwtResponses = responses.filter(r => r.url.includes('/api/auth/test/'));
    
    expect(jwtRequests.length).toBe(1);
    expect(jwtResponses.length).toBe(1);
    expect(jwtResponses[0].status).toBe(200);
  });

  test('should manage user lifecycle with signup and deletion', async ({ page }) => {
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
      if (url.includes('/api/auth/')) {
        const responseBody = await response.json();
        console.log('Auth API Response:', JSON.stringify(responseBody, null, 2));
      }
      responses.push({
        url: url,
        status: response.status()
      });
      console.log('Network response:', url, response.status());
    });

    // Test user signup and management
    const signupButton = page.getByRole('button', { name: 'Sign Up' });
    await expect(signupButton).toBeVisible();
    
    // First signup
    const signupResponsePromise = page.waitForResponse(response => 
      response.url().includes('/api/auth/signup/') && response.status() === 201
    );
    await signupButton.click();
    const signupResponse = await signupResponsePromise;
    const signupData = await signupResponse.json();
    
    // Verify first user creation
    const userStatus = await page.waitForSelector('[data-testid="user-status"]', { timeout: 10000 });
    const userStatusText = await userStatus.textContent();
    expect(userStatusText).toContain('User created successfully');
    expect(signupData.user.username).toMatch(/Random_[a-z]{8}/);
    
    // Store first user's info
    const firstUsername = signupData.user.username;
    const firstEmail = signupData.user.email;

    // Click again to trigger deletion and recreation
    const deletePromise = page.waitForResponse(response => 
      response.url().includes('/api/auth/delete/') && response.status() === 200
    );
    const newSignupPromise = page.waitForResponse(response => 
      response.url().includes('/api/auth/signup/') && response.status() === 201
    );
    
    await signupButton.click();
    
    // Wait for both responses
    const [deleteResponse, newSignupResponse] = await Promise.all([
      deletePromise,
      newSignupPromise
    ]);

    // Verify deletion
    const deleteData = await deleteResponse.json();
    expect(deleteData.message).toBe('User deleted successfully');

    // Verify new user creation
    const newSignupData = await newSignupResponse.json();
    expect(newSignupData.user.username).toMatch(/Random_[a-z]{8}/);
    expect(newSignupData.user.username).not.toBe(firstUsername);
    expect(newSignupData.user.email).not.toBe(firstEmail);

    // Verify final UI state
    const finalUserStatus = await page.waitForSelector('[data-testid="user-status"]', { timeout: 10000 });
    const finalStatusText = await finalUserStatus.textContent();
    expect(finalStatusText).toContain('User created successfully');
    expect(finalStatusText).toContain(newSignupData.user.username);

    // Verify network activity
    const authRequests = requests.filter(url => url.includes('/api/auth/'));
    const authResponses = responses.filter(r => r.url.includes('/api/auth/'));
    
    // We expect 2 requests: initial signup and delete+new signup
    expect(authRequests.length).toBe(3);
    expect(authResponses.length).toBe(3);
    
    // Print network activity for debugging
    console.log('Auth requests:', authRequests);
    console.log('Auth responses:', authResponses);
  });
});
