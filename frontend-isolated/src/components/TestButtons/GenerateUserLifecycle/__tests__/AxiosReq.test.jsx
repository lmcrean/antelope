import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { UserLifecycleButton } from '../UserLifecycleButton'

vi.mock('axios', () => ({
  default: {
    post: vi.fn()
  }
}))

const mockLifecycleResponse = {
  message: 'User lifecycle test completed successfully',
  details: {
    signup: 'success',
    signin: 'success',
    delete: 'success'
  }
}

const mockToken = 'mock-jwt-token'

describe('UserLifecycleButton - Axios Request', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('makes correct API call to test user lifecycle', async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({ data: mockLifecycleResponse })
    render(<UserLifecycleButton token={mockToken} />)
    
    fireEvent.click(screen.getByRole('button'))
    
    expect(axios.post).toHaveBeenCalledWith(
      '/api/auth/test/',
      {
        username: expect.stringMatching(/^testuser\d+$/),
        password: expect.stringMatching(/^Test\d+!123$/)
      },
      {
        headers: {
          'Authorization': `Bearer ${mockToken}`
        }
      }
    )
  })

  it('shows error when no token is provided', async () => {
    render(<UserLifecycleButton />)
    
    fireEvent.click(screen.getByRole('button'))
    
    const errorMessage = screen.getByTestId('error-message')
    expect(errorMessage).toHaveTextContent('Please generate a JWT token first')
  })

  it('passes success response to onSuccess callback', async () => {
    const onSuccess = vi.fn()
    vi.mocked(axios.post).mockResolvedValueOnce({ data: mockLifecycleResponse })
    
    render(<UserLifecycleButton token={mockToken} onSuccess={onSuccess} />)
    fireEvent.click(screen.getByRole('button'))
    
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(mockLifecycleResponse)
    })
  })

  it('handles validation error response correctly', async () => {
    const onError = vi.fn()
    const errorResponse = { 
      response: { 
        data: { 
          message: 'Invalid username format'
        }
      }
    }
    vi.mocked(axios.post).mockRejectedValueOnce(errorResponse)
    
    render(<UserLifecycleButton token={mockToken} onError={onError} />)
    fireEvent.click(screen.getByRole('button'))
    
    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith('Invalid username format')
      const errorMessage = screen.getByTestId('error-message')
      expect(errorMessage).toHaveTextContent('Invalid username format')
    })
  })

  it('handles network error correctly', async () => {
    const onError = vi.fn()
    const errorMessage = 'Network Error'
    vi.mocked(axios.post).mockRejectedValueOnce(new Error(errorMessage))
    
    render(<UserLifecycleButton token={mockToken} onError={onError} />)
    fireEvent.click(screen.getByRole('button'))
    
    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(errorMessage)
      const errorElement = screen.getByTestId('error-message')
      expect(errorElement).toHaveTextContent(errorMessage)
    })
  })

  it('handles duplicate user error correctly', async () => {
    const onError = vi.fn()
    const errorResponse = { 
      response: { 
        data: { 
          message: 'User already exists'
        }
      }
    }
    vi.mocked(axios.post).mockRejectedValueOnce(errorResponse)
    
    render(<UserLifecycleButton token={mockToken} onError={onError} />)
    fireEvent.click(screen.getByRole('button'))
    
    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith('User already exists')
      const errorMessage = screen.getByTestId('error-message')
      expect(errorMessage).toHaveTextContent('User already exists')
    })
  })

  it('sets loading state during API call', async () => {
    let resolvePromise
    const promise = new Promise(resolve => {
      resolvePromise = resolve
    })
    vi.mocked(axios.post).mockImplementationOnce(() => promise)
    
    render(<UserLifecycleButton token={mockToken} />)
    fireEvent.click(screen.getByRole('button'))
    
    expect(screen.getByRole('button')).toBeDisabled()
    
    resolvePromise({ data: mockLifecycleResponse })
    await waitFor(() => {
      expect(screen.getByRole('button')).not.toBeDisabled()
    })
  })
}) 