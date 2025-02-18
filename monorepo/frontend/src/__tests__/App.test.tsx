import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from '../App'
import axios from 'axios'
import type { Mock } from 'vitest'

// Mock axios
vi.mock('axios')
const mockedAxios = {
  get: vi.fn()
} as { get: Mock }

describe('App Health Check', () => {
  it('should show Supabase connection status when health check button is clicked', async () => {
    // Mock successful response
    mockedAxios.get.mockResolvedValueOnce({
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
    expect(screen.getByText('Checking API health...')).toBeTruthy()

    // Wait for and verify the success state
    await waitFor(() => {
      expect(screen.getByText('API Status: healthy')).toBeTruthy()
      expect(screen.getByText('All systems operational')).toBeTruthy()
      expect(screen.getByText('Supabase Connection: Connected')).toBeTruthy()
    })

    // Verify that axios was called with the correct endpoint
    expect(mockedAxios.get).toHaveBeenCalledWith('/api/health/')
  })

  it('should show error state when Supabase connection fails', async () => {
    // Mock failed response
    mockedAxios.get.mockRejectedValueOnce(new Error('Failed to connect'))

    render(<App />)
    
    const healthCheckButton = screen.getByText('Check API Health')
    fireEvent.click(healthCheckButton)

    // Wait for and verify the error state
    await waitFor(() => {
      expect(screen.getByText(/API Status: unhealthy/)).toBeTruthy()
      expect(screen.getByText(/Failed to connect/)).toBeTruthy()
    })
  })
}) 