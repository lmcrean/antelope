import { test, expect } from '@playwright/test'

test.describe('GetSupabaseHealth Component (Dev Mode)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display initial state correctly', async ({ page }) => {
    const button = await page.getByTestId('api-health-button')
    await expect(button).toBeVisible()
    await expect(button).toHaveText('Check API Health')
    await expect(page.getByTestId('api-health-status')).not.toBeVisible()
    await expect(page.getByTestId('error-message')).not.toBeVisible()
  })

  test('should display healthy status after successful API call', async ({ page }) => {
    const button = await page.getByTestId('api-health-button')
    await button.click()

    await expect(page.getByTestId('api-health-status')).toBeVisible()
    await expect(page.getByText('Status: healthy')).toBeVisible()
    await expect(page.getByText('Supabase Connected: Yes')).toBeVisible()
  })

  test('should handle API errors gracefully', async ({ page }) => {
    // Force the API to fail by disconnecting network
    await page.route('**/api/health', route => route.abort())
    
    const button = await page.getByTestId('api-health-button')
    await button.click()

    await expect(page.getByTestId('error-message')).toBeVisible()
  })

  test('should show degraded status when API reports issues', async ({ page }) => {
    // Mock a degraded response
    await page.route('**/api/health', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'degraded',
          supabase_connected: true,
          message: 'Some services experiencing delays'
        })
      })
    })

    const button = await page.getByTestId('api-health-button')
    await button.click()

    await expect(page.getByTestId('api-health-status')).toBeVisible()
    await expect(page.getByText('Status: degraded')).toBeVisible()
    await expect(page.getByText('Some services experiencing delays')).toBeVisible()
  })

  test('should handle disconnected Supabase state', async ({ page }) => {
    // Mock a response where Supabase is disconnected
    await page.route('**/api/health', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'degraded',
          supabase_connected: false,
          message: 'Unable to connect to Supabase'
        })
      })
    })

    const button = await page.getByTestId('api-health-button')
    await button.click()

    await expect(page.getByTestId('api-health-status')).toBeVisible()
    await expect(page.getByText('Supabase Connected: No')).toBeVisible()
    await expect(page.getByText('Unable to connect to Supabase')).toBeVisible()
  })

  test('should disable button during API call', async ({ page }) => {
    const button = await page.getByTestId('api-health-button')
    await button.click()
    
    // Button should be disabled while request is in flight
    await expect(button).toBeDisabled()
    
    // Wait for request to complete
    await expect(page.getByTestId('api-health-status')).toBeVisible()
    
    // Button should be enabled again
    await expect(button).toBeEnabled()
  })
}) 