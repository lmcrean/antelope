import { test, expect } from '@playwright/test'

test.describe('API Health Check Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3001/')
  })

  test('should verify API health check functionality', async ({ page }) => {
    // Start collecting network requests and responses
    const requests: string[] = []
    const responses: { url: string; status: number }[] = []

    // Monitor network requests and responses
    page.on('request', request => {
      const url = request.url()
      requests.push(url)
      console.log('Network request:', url)
    })

    page.on('response', async response => {
      const url = response.url()
      if (url.includes('/api/health')) {
        const responseBody = await response.json()
        console.log('Health API Response:', JSON.stringify(responseBody, null, 2))
      }
      responses.push({
        url: url,
        status: response.status()
      })
      console.log('Network response:', url, response.status())
    })

    // Verify API health button exists
    const healthButton = page.getByTestId('api-health-button')
    await expect(healthButton).toBeVisible()
    
    // Click the button and wait for the health check response
    const responsePromise = page.waitForResponse(response => 
      response.url().includes('/api/health') && response.status() === 200
    )
    await healthButton.click()
    const healthResponse = await responsePromise
    
    // Wait for and verify the response in the UI
    const healthStatus = await page.waitForSelector('[data-testid="api-health-status"]', { timeout: 10000 })
    const statusText = await healthStatus.textContent()
    
    // The response should be successful
    expect(statusText).toContain('API Health Status:')
    expect(statusText).toContain('Status: healthy')
    expect(statusText).toContain('Supabase Connected: Yes')

    // Verify the response data
    const responseData = await healthResponse.json()
    expect(responseData).toHaveProperty('status', 'healthy')
    expect(responseData).toHaveProperty('supabase_connected', true)
    expect(responseData).toHaveProperty('message')

    // Verify container color changes to green for healthy status
    const container = page.getByTestId('api-health-container')
    await expect(container).toHaveClass(/bg-green-900\/20/)

    // Verify network activity
    const apiRequests = requests.filter(url => url.includes('/api/health'))
    const apiResponses = responses.filter(r => r.url.includes('/api/health'))
    
    expect(apiRequests.length).toBe(1)
    expect(apiResponses.length).toBe(1)
    expect(apiResponses[0].status).toBe(200)
  })

  test('should handle API health check errors', async ({ page }) => {
    // Navigate to the page first
    await page.goto('http://localhost:3001/')

    // Mock the API to return an error
    await page.route('**/api/health**', async route => {
      await route.abort('failed')
    })

    // Click the health check button
    const healthButton = page.getByTestId('api-health-button')
    await healthButton.click()

    // Wait for error message with a longer timeout
    const errorMessage = await page.getByTestId('error-message')
    await expect(errorMessage).toBeVisible({ timeout: 10000 })
    const errorText = await errorMessage.textContent()
    expect(errorText).toContain('Network Error')

    // Verify container color changes to red for error status
    const container = page.getByTestId('api-health-container')
    await expect(container).toHaveClass(/bg-red-900\/20/)
  })

  test('should disable button during health check', async ({ page }) => {
    // Navigate to the page first
    await page.goto('http://localhost:3001/')

    // Set up request interception with delay
    await page.route('**/api/health**', async route => {
      // Ensure we're intercepting the correct request
      const request = route.request()
      if (request.method() === 'GET') {
        await new Promise(resolve => setTimeout(resolve, 2000))
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'healthy',
            message: 'API is healthy',
            supabase_connected: true
          })
        })
      } else {
        await route.continue()
      }
    })

    // Click the health check button
    const healthButton = page.getByTestId('api-health-button')
    await healthButton.click()

    // Verify button is disabled during the request
    await expect(healthButton).toBeDisabled()

    // Wait for the response and verify button is re-enabled
    await page.waitForSelector('[data-testid="api-health-status"]')
    await expect(healthButton).toBeEnabled()
  })
}) 