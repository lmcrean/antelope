import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { GenerateJWTButton } from '../GenerateJWTButton'

vi.mock('axios')

const mockJwtResponse = {
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U'
}

describe('GenerateJWTButton - Axios Request', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('makes correct API call to generate JWT', async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({ data: mockJwtResponse })
    render(<GenerateJWTButton />)
    
    fireEvent.click(screen.getByRole('button'))
    
    expect(axios.post).toHaveBeenCalledWith('/api/auth/generate-jwt')
  })

  it('passes success response to onSuccess callback', async () => {
    const onSuccess = vi.fn()
    vi.mocked(axios.post).mockResolvedValueOnce({ data: mockJwtResponse })
    
    render(<GenerateJWTButton onSuccess={onSuccess} />)
    fireEvent.click(screen.getByRole('button'))
    
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(mockJwtResponse)
    })
  })

  it('handles network error correctly', async () => {
    const onError = vi.fn()
    const errorMessage = 'Network Error'
    vi.mocked(axios.post).mockRejectedValueOnce(new Error(errorMessage))
    
    render(<GenerateJWTButton onError={onError} />)
    fireEvent.click(screen.getByRole('button'))
    
    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(errorMessage)
    })
  })

  it('handles API error response correctly', async () => {
    const onError = vi.fn()
    const errorResponse = { 
      response: { 
        data: { message: 'Invalid request' }
      }
    }
    vi.mocked(axios.post).mockRejectedValueOnce(errorResponse)
    
    render(<GenerateJWTButton onError={onError} />)
    fireEvent.click(screen.getByRole('button'))
    
    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith('Invalid request')
    })
  })

  it('sets loading state during API call', async () => {
    let resolvePromise
    const promise = new Promise(resolve => {
      resolvePromise = resolve
    })
    vi.mocked(axios.post).mockImplementationOnce(() => promise)
    
    render(<GenerateJWTButton />)
    fireEvent.click(screen.getByRole('button'))
    
    expect(screen.getByRole('button')).toBeDisabled()
    
    resolvePromise({ data: mockJwtResponse })
    await waitFor(() => {
      expect(screen.getByRole('button')).not.toBeDisabled()
    })
  })
}) 