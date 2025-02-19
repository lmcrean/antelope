import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from '../App'
import axios from 'axios'

// Mock axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    isAxiosError: (error: any) => error instanceof Error
  }
}))

describe('App Health Check', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show Supabase connection status when health check button is clicked', async () => {
    // Mock successful response
    (axios.get as any).mockResolvedValueOnce({
      data: {
        status: 'healthy',
        message: 'All systems operational',
        supabase_connected: true
      }
    })

    render(<App />)
    
    // Find and click the health check button
    const healthCheckButton = screen.getByText('Check API Health')
    fireEvent.click(healthCheckButton)

    // Wait for and verify the loading state
    expect(screen.getByText('Checking API health...')).toBeInTheDocument()

    // Wait for and verify the success state
    await waitFor(() => {
      const healthStatus = screen.getByTestId('health-status')
      expect(healthStatus).toBeInTheDocument()
      expect(healthStatus.textContent).toContain('API Status: healthy')
      expect(healthStatus.textContent).toContain('All systems operational')
      expect(healthStatus.textContent).toContain('Supabase Connection: Connected')
    })

    // Verify that axios was called with the correct endpoint
    expect(axios.get).toHaveBeenCalledWith('/api/health/')
  })

  it('should show error state when Supabase connection fails', async () => {
    // Mock failed response
    const error = new Error('Failed to check API health')
    error.name = 'Error'
    ;(axios.get as any).mockRejectedValueOnce(error)

    render(<App />)
    
    const healthCheckButton = screen.getByText('Check API Health')
    fireEvent.click(healthCheckButton)

    // Wait for and verify the error state
    await waitFor(() => {
      const healthStatus = screen.getByTestId('health-status')
      expect(healthStatus).toBeInTheDocument()
      expect(healthStatus.textContent).toContain('API Status: unhealthy')
      expect(healthStatus.textContent).toContain('Failed to check API health')
    })
  })
}) 