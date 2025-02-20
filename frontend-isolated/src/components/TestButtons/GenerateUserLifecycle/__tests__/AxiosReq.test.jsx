import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { UserLifecycleButton } from '../UserLifecycleButton'

vi.mock('axios')

const mockUserResponse = {
  user: {
    id: 'user_123',
    email: 'test@example.com',
    created_at: '2024-02-20T12:00:00Z',
    status: 'active'
  },
  session: {
    id: 'session_456',
    expires_at: '2024-02-21T12:00:00Z'
  }
}

describe('UserLifecycleButton - Axios Request', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('makes correct API call to create user', async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({ data: mockUserResponse })
    render(<UserLifecycleButton />)
    
    fireEvent.click(screen.getByRole('button'))
    
    expect(axios.post).toHaveBeenCalledWith('/api/auth/create-user', {
      email: expect.any(String),
      password: expect.any(String)
    })
  })

  it('passes success response to onSuccess callback', async () => {
    const onSuccess = vi.fn()
    vi.mocked(axios.post).mockResolvedValueOnce({ data: mockUserResponse })
    
    render(<UserLifecycleButton onSuccess={onSuccess} />)
    fireEvent.click(screen.getByRole('button'))
    
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(mockUserResponse)
    })
  })

  it('handles validation error response correctly', async () => {
    const onError = vi.fn()
    const errorResponse = { 
      response: { 
        data: { 
          message: 'Invalid email format',
          errors: ['Email must be a valid email address']
        }
      }
    }
    vi.mocked(axios.post).mockRejectedValueOnce(errorResponse)
    
    render(<UserLifecycleButton onError={onError} />)
    fireEvent.click(screen.getByRole('button'))
    
    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith('Invalid email format')
    })
  })

  it('handles network error correctly', async () => {
    const onError = vi.fn()
    const errorMessage = 'Network Error'
    vi.mocked(axios.post).mockRejectedValueOnce(new Error(errorMessage))
    
    render(<UserLifecycleButton onError={onError} />)
    fireEvent.click(screen.getByRole('button'))
    
    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(errorMessage)
    })
  })

  it('handles duplicate user error correctly', async () => {
    const onError = vi.fn()
    const errorResponse = { 
      response: { 
        data: { 
          message: 'User already exists',
          code: 'auth/email-already-in-use'
        }
      }
    }
    vi.mocked(axios.post).mockRejectedValueOnce(errorResponse)
    
    render(<UserLifecycleButton onError={onError} />)
    fireEvent.click(screen.getByRole('button'))
    
    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith('User already exists')
    })
  })

  it('sets loading state during API call', async () => {
    let resolvePromise
    const promise = new Promise(resolve => {
      resolvePromise = resolve
    })
    vi.mocked(axios.post).mockImplementationOnce(() => promise)
    
    render(<UserLifecycleButton />)
    fireEvent.click(screen.getByRole('button'))
    
    expect(screen.getByRole('button')).toBeDisabled()
    
    resolvePromise({ data: mockUserResponse })
    await waitFor(() => {
      expect(screen.getByRole('button')).not.toBeDisabled()
    })
  })
}) 