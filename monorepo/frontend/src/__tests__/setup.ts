import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock fetch globally
global.fetch = vi.fn()

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
}) 