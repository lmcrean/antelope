import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { UserLifecycleButton } from '../UserLifecycleButton'

vi.mock('axios')

const mockLifecycleResponse = {
  message: 'User lifecycle test completed successfully',
  details: {
    signup: 'success',
    signin: 'success',
    delete: 'success'
  }
}

describe('UserLifecycleButton - After Request', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('displays lifecycle details after successful test', async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({ data: mockLifecycleResponse })
    render(<UserLifecycleButton />)
    
    fireEvent.click(screen.getByRole('button'))
    
    await waitFor(() => {
      // Check headers and message
      expect(screen.getByText('Lifecycle Test Results:')).toBeInTheDocument()
      expect(screen.getByTestId('test-username')).toHaveTextContent(/testuser\d+/)
      expect(screen.getByTestId('lifecycle-message')).toHaveTextContent(mockLifecycleResponse.message)
      
      // Check lifecycle stages
      expect(screen.getByTestId('signup-status')).toHaveTextContent(mockLifecycleResponse.details.signup)
      expect(screen.getByTestId('signin-status')).toHaveTextContent(mockLifecycleResponse.details.signin)
      expect(screen.getByTestId('delete-status')).toHaveTextContent(mockLifecycleResponse.details.delete)
    })
  })

  it('clears previous error when new request is successful', async () => {
    vi.mocked(axios.post)
      .mockRejectedValueOnce(new Error('Initial error'))
      .mockResolvedValueOnce({ data: mockLifecycleResponse })
    
    render(<UserLifecycleButton />)
    
    // First request - should fail
    fireEvent.click(screen.getByRole('button'))
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent(/Initial error/)
    })
    
    // Second request - should succeed and clear error
    fireEvent.click(screen.getByRole('button'))
    await waitFor(() => {
      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument()
      expect(screen.getByTestId('lifecycle-message')).toHaveTextContent(mockLifecycleResponse.message)
    })
  })

  it('clears previous lifecycle data when new request fails', async () => {
    vi.mocked(axios.post)
      .mockResolvedValueOnce({ data: mockLifecycleResponse })
      .mockRejectedValueOnce(new Error('Subsequent error'))
    
    render(<UserLifecycleButton />)
    
    // First request - should succeed
    fireEvent.click(screen.getByRole('button'))
    await waitFor(() => {
      expect(screen.getByTestId('lifecycle-message')).toHaveTextContent(mockLifecycleResponse.message)
    })
    
    // Second request - should fail and clear lifecycle data
    fireEvent.click(screen.getByRole('button'))
    await waitFor(() => {
      expect(screen.queryByTestId('lifecycle-message')).not.toBeInTheDocument()
      expect(screen.getByTestId('error-message')).toHaveTextContent(/Subsequent error/)
    })
  })

  it('maintains proper styling through request lifecycle', async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({ data: mockLifecycleResponse })
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