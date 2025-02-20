import { test, expect } from '@playwright/test'
import '../GetApiMessage/__tests__/Dev.spec.js'
import '../GetSupabaseHealth/__tests__/Dev.spec.js'
import '../GenerateJwt/__tests__/Dev.spec.js'
import '../GenerateUserLifecycle/__tests__/Dev.spec.js'

// This file serves as the entry point for all development environment tests
// Individual component tests are imported from their respective directories above
test.describe('Development Environment Setup', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to development environment
    await page.goto('http://localhost:3002') // Updated port based on Vite output
    await expect(page).toHaveTitle(/Vite \+ React/)
  })
})
