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

describe('UserLifecycleButton - After Request', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('displays user details after successful creation', async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({ data: mockUserResponse })
    render(<UserLifecycleButton />)
    
    fireEvent.click(screen.getByRole('button'))
    
    await waitFor(() => {
      expect(screen.getByText('User Created:')).toBeInTheDocument()
      expect(screen.getByText(mockUserResponse.user.id)).toBeInTheDocument()
      expect(screen.getByText(mockUserResponse.user.email)).toBeInTheDocument()
      expect(screen.getByText(mockUserResponse.user.status)).toBeInTheDocument()
    })
  })

  it('displays session information after successful creation', async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({ data: mockUserResponse })
    render(<UserLifecycleButton />)
    
    fireEvent.click(screen.getByRole('button'))
    
    await waitFor(() => {
      expect(screen.getByText('Session Info:')).toBeInTheDocument()
      expect(screen.getByText(mockUserResponse.session.id)).toBeInTheDocument()
      expect(screen.getByText(new Date(mockUserResponse.session.expires_at).toLocaleString())).toBeInTheDocument()
    })
  })

  it('clears previous error when new request is successful', async () => {
    vi.mocked(axios.post)
      .mockRejectedValueOnce(new Error('Initial error'))
      .mockResolvedValueOnce({ data: mockUserResponse })
    
    render(<UserLifecycleButton />)
    
    // First request - should fail
    fireEvent.click(screen.getByRole('button'))
    await waitFor(() => {
      expect(screen.getByText(/Initial error/)).toBeInTheDocument()
    })
    
    // Second request - should succeed and clear error
    fireEvent.click(screen.getByRole('button'))
    await waitFor(() => {
      expect(screen.queryByText(/Initial error/)).not.toBeInTheDocument()
      expect(screen.getByText(mockUserResponse.user.id)).toBeInTheDocument()
    })
  })

  it('clears previous user data when new request fails', async () => {
    vi.mocked(axios.post)
      .mockResolvedValueOnce({ data: mockUserResponse })
      .mockRejectedValueOnce(new Error('Subsequent error'))
    
    render(<UserLifecycleButton />)
    
    // First request - should succeed
    fireEvent.click(screen.getByRole('button'))
    await waitFor(() => {
      expect(screen.getByText(mockUserResponse.user.id)).toBeInTheDocument()
    })
    
    // Second request - should fail and clear user data
    fireEvent.click(screen.getByRole('button'))
    await waitFor(() => {
      expect(screen.queryByText(mockUserResponse.user.id)).not.toBeInTheDocument()
      expect(screen.getByText(/Subsequent error/)).toBeInTheDocument()
    })
  })

  it('formats dates correctly in the UI', async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({ data: mockUserResponse })
    render(<UserLifecycleButton />)
    
    fireEvent.click(screen.getByRole('button'))
    
    await waitFor(() => {
      const createdDate = new Date(mockUserResponse.user.created_at).toLocaleString()
      const expiresDate = new Date(mockUserResponse.session.expires_at).toLocaleString()
      
      expect(screen.getByText(createdDate)).toBeInTheDocument()
      expect(screen.getByText(expiresDate)).toBeInTheDocument()
    })
  })

  it('maintains proper styling through request lifecycle', async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({ data: mockUserResponse })
    render(<UserLifecycleButton />)
    const button = screen.getByRole('button')
    
    // Initial state
    expect(button).toHaveClass('bg-blue-500')
    
    // During request
    fireEvent.click(button)
    expect(button).toBeDisabled()
    
    // After success
    await waitFor(() => {
      expect(button).not.toBeDisabled()
      expect(button).toHaveClass('bg-blue-500')
    })
  })
}) 