/// <reference types="vitest" />
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { UserLifecycleButton } from '../UserLifecycleButton'

vi.mock('axios')

const mockLifecycleResponse = {
  message: ['Success: User lifecycle test completed'],
  user: 'test_user',
  userLifecycle: {
    created: 'Random_2533',
    signedIn: 'Random_2533'
  }
}

describe('UserLifecycleButton', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renders correctly with initial state', () => {
    render(<UserLifecycleButton />)
    expect(screen.getByTestId('user-lifecycle-button')).toBeInTheDocument()
    expect(screen.getByTestId('user-lifecycle-button')).toHaveTextContent('Sign Up')
    expect(screen.getByTestId('user-lifecycle-container')).toHaveClass('bg-red-900/20')
  })

  it('handles successful user lifecycle test', async () => {
    const onSuccess = vi.fn()
    vi.mocked(axios.post).mockResolvedValueOnce({ data: mockLifecycleResponse })

    render(<UserLifecycleButton onSuccess={onSuccess} />)
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('user-lifecycle-button'))
    })
    
    await waitFor(() => {
      expect(screen.getByTestId('user-lifecycle-status')).toBeInTheDocument()
    })

    // Verify container color
    expect(screen.getByTestId('user-lifecycle-container')).toHaveClass('bg-green-900/20')

    // Verify user lifecycle events
    expect(screen.getByText('signed up with user [Random_2533]')).toBeInTheDocument()
    expect(screen.getByText('now signed in with user [Random_2533]')).toBeInTheDocument()
    
    // Verify button text changed
    expect(screen.getByTestId('user-lifecycle-button')).toHaveTextContent('Test User Lifecycle')
    
    expect(onSuccess).toHaveBeenCalledWith(mockLifecycleResponse)
  })

  it('handles user lifecycle with deletion', async () => {
    const responseWithDeletion = {
      ...mockLifecycleResponse,
      userLifecycle: {
        deleted: 'Random_3934',
        created: 'Random_2533',
        signedIn: 'Random_2533'
      }
    }

    vi.mocked(axios.post).mockResolvedValueOnce({ data: responseWithDeletion })

    render(<UserLifecycleButton />)
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('user-lifecycle-button'))
    })
    
    await waitFor(() => {
      expect(screen.getByTestId('user-lifecycle-status')).toBeInTheDocument()
    })

    expect(screen.getByText('deleted user [Random_3934]')).toBeInTheDocument()
    expect(screen.getByText('signed up with user [Random_2533]')).toBeInTheDocument()
    expect(screen.getByText('now signed in with user [Random_2533]')).toBeInTheDocument()
  })

  it('handles user lifecycle error', async () => {
    const errorResponse = {
      message: ['User lifecycle test failed'],
      user: '',
      userLifecycle: {
        error: 'could not sign up with user [Random_3432]'
      }
    }
    
    vi.mocked(axios.post).mockResolvedValueOnce({ data: errorResponse })

    render(<UserLifecycleButton />)
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('user-lifecycle-button'))
    })

    await waitFor(() => {
      expect(screen.getByTestId('user-lifecycle-container')).toHaveClass('bg-yellow-900/20')
    })

    expect(screen.getByText('could not sign up with user [Random_3432]')).toBeInTheDocument()
  })

  it('handles error during lifecycle test', async () => {
    const onError = vi.fn()
    const errorMessage = 'Failed to fetch'
    vi.mocked(axios.post).mockRejectedValueOnce(new Error(errorMessage))

    render(<UserLifecycleButton onError={onError} />)
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('user-lifecycle-button'))
    })
    
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument()
    })

    expect(screen.getByTestId('user-lifecycle-container')).toHaveClass('bg-red-900/20')
    expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument()
    expect(onError).toHaveBeenCalledWith(errorMessage)
  })

  it('disables button during loading', async () => {
    vi.mocked(axios.post).mockImplementationOnce(() => new Promise(() => {}))

    render(<UserLifecycleButton />)
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('user-lifecycle-button'))
    })
    
    expect(screen.getByTestId('user-lifecycle-button')).toBeDisabled()
  })
}) 