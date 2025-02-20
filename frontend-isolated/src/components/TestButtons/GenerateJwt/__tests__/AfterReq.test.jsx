import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { GenerateJWTButton } from '../GenerateJWTButton'

vi.mock('axios')

const mockJwtResponse = {
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U'
}

describe('GenerateJWTButton - After Request', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('displays the JWT token after successful request', async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({ data: mockJwtResponse })
    render(<GenerateJWTButton />)
    
    fireEvent.click(screen.getByRole('button'))
    
    await waitFor(() => {
      expect(screen.getByText('Token:')).toBeInTheDocument()
      expect(screen.getByText(mockJwtResponse.token)).toBeInTheDocument()
    })
  })

  it('clears previous error when new request is successful', async () => {
    vi.mocked(axios.post)
      .mockRejectedValueOnce(new Error('Initial error'))
      .mockResolvedValueOnce({ data: mockJwtResponse })
    
    render(<GenerateJWTButton />)
    
    // First request - should fail
    fireEvent.click(screen.getByRole('button'))
    await waitFor(() => {
      expect(screen.getByText(/Initial error/)).toBeInTheDocument()
    })
    
    // Second request - should succeed and clear error
    fireEvent.click(screen.getByRole('button'))
    await waitFor(() => {
      expect(screen.queryByText(/Initial error/)).not.toBeInTheDocument()
      expect(screen.getByText(mockJwtResponse.token)).toBeInTheDocument()
    })
  })

  it('clears previous token when new request fails', async () => {
    vi.mocked(axios.post)
      .mockResolvedValueOnce({ data: mockJwtResponse })
      .mockRejectedValueOnce(new Error('Subsequent error'))
    
    render(<GenerateJWTButton />)
    
    // First request - should succeed
    fireEvent.click(screen.getByRole('button'))
    await waitFor(() => {
      expect(screen.getByText(mockJwtResponse.token)).toBeInTheDocument()
    })
    
    // Second request - should fail and clear token
    fireEvent.click(screen.getByRole('button'))
    await waitFor(() => {
      expect(screen.queryByText(mockJwtResponse.token)).not.toBeInTheDocument()
      expect(screen.getByText(/Subsequent error/)).toBeInTheDocument()
    })
  })

  it('displays API error message in the UI', async () => {
    const errorResponse = { 
      response: { 
        data: { message: 'Invalid request parameters' }
      }
    }
    vi.mocked(axios.post).mockRejectedValueOnce(errorResponse)
    
    render(<GenerateJWTButton />)
    fireEvent.click(screen.getByRole('button'))
    
    await waitFor(() => {
      expect(screen.getByText(/Invalid request parameters/)).toBeInTheDocument()
    })
  })

  it('displays network error message in the UI', async () => {
    vi.mocked(axios.post).mockRejectedValueOnce(new Error('Network Error'))
    
    render(<GenerateJWTButton />)
    fireEvent.click(screen.getByRole('button'))
    
    await waitFor(() => {
      expect(screen.getByText(/Network Error/)).toBeInTheDocument()
    })
  })

  it('maintains proper button state through multiple requests', async () => {
    vi.mocked(axios.post)
      .mockResolvedValueOnce({ data: mockJwtResponse })
      .mockRejectedValueOnce(new Error('Error'))
      .mockResolvedValueOnce({ data: mockJwtResponse })
    
    render(<GenerateJWTButton />)
    const button = screen.getByRole('button')
    
    // First request - success
    fireEvent.click(button)
    expect(button).toBeDisabled()
    await waitFor(() => {
      expect(button).not.toBeDisabled()
      expect(screen.getByText(mockJwtResponse.token)).toBeInTheDocument()
    })
    
    // Second request - error
    fireEvent.click(button)
    expect(button).toBeDisabled()
    await waitFor(() => {
      expect(button).not.toBeDisabled()
      expect(screen.getByText(/Error/)).toBeInTheDocument()
    })
    
    // Third request - success
    fireEvent.click(button)
    expect(button).toBeDisabled()
    await waitFor(() => {
      expect(button).not.toBeDisabled()
      expect(screen.getByText(mockJwtResponse.token)).toBeInTheDocument()
    })
  })
}) 