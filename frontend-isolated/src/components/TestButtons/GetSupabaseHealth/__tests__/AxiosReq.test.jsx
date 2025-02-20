/// <reference types="vitest" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { APIHealthButton } from '../GetSupaBaseHealthButton'

vi.mock('axios')

describe('GetSupabaseHealth Axios Requests', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should make a GET request to /api/health/', async () => {
    const mockResponse = {
      status: 'healthy',
      message: 'API is healthy',
      supabase_connected: true
    }
    vi.mocked(axios.get).mockResolvedValueOnce({ data: mockResponse })

    render(<APIHealthButton />)
    fireEvent.click(screen.getByTestId('api-health-button'))

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/health/')
      expect(screen.getByTestId('api-health-status')).toBeInTheDocument()
    })
  })

  it('should handle 404 error', async () => {
    const mockError = {
      isAxiosError: true,
      response: { status: 404 }
    }
    vi.spyOn(axios, 'isAxiosError').mockReturnValue(true)
    vi.mocked(axios.get).mockRejectedValueOnce(mockError)

    render(<APIHealthButton />)
    fireEvent.click(screen.getByTestId('api-health-button'))

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('API endpoint not found')
    })
  })

  it('should handle 500 error', async () => {
    const mockError = {
      isAxiosError: true,
      response: { status: 500 }
    }
    vi.spyOn(axios, 'isAxiosError').mockReturnValue(true)
    vi.mocked(axios.get).mockRejectedValueOnce(mockError)

    render(<APIHealthButton />)
    fireEvent.click(screen.getByTestId('api-health-button'))

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Internal server error')
    })
  })

  it('should handle non-axios error', async () => {
    vi.spyOn(axios, 'isAxiosError').mockReturnValue(false)
    vi.mocked(axios.get).mockRejectedValueOnce(new Error('Network error'))

    render(<APIHealthButton />)
    fireEvent.click(screen.getByTestId('api-health-button'))

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('API Error')
    })
  })
})
