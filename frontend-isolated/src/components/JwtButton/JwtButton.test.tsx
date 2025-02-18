/// <reference types="vitest" />
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { JwtButton } from './JwtButton'

const mockJwtResponse = {
  message: [
    'Success: generated JWT token',
    'Success: token has service role permissions'
  ],
  user: 'service_role',
  jwt: 'mock.jwt.token',
  userLifecycle: {
    created: 'Random_2533',
    signedIn: 'Random_2533'
  }
}

describe('JwtButton', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    global.fetch = vi.fn()
  })

  it('renders correctly', () => {
    render(<JwtButton />)
    expect(screen.getByTestId('jwt-test-button')).toBeInTheDocument()
    expect(screen.getByTestId('jwt-test-button')).toHaveTextContent('Test JWT')
    expect(screen.getByTestId('jwt-container')).toHaveClass('bg-red-900/20')
  })

  it('handles successful JWT test with initial verification only', async () => {
    const onSuccess = vi.fn()
    ;(global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockJwtResponse)
    })

    render(<JwtButton onSuccess={onSuccess} />)
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('jwt-test-button'))
    })
    
    await waitFor(() => {
      expect(screen.getByTestId('jwt-status')).toBeInTheDocument()
    })

    // Verify container color
    expect(screen.getByTestId('jwt-container')).toHaveClass('bg-green-900/20')

    // Verify JWT Generation section with token
    mockJwtResponse.message.forEach(msg => {
      const msgElement = screen.getByText(msg)
      expect(msgElement).toBeInTheDocument()
      expect(msgElement.previousElementSibling).toHaveClass('text-green-400')
    })
    expect(screen.getByText('mock.jwt.token')).toBeInTheDocument()

    // Verify User Lifecycle section shows only verification status
    expect(screen.getByText('Verified')).toBeInTheDocument()
    expect(screen.queryByText('Created user Random_2533')).not.toBeInTheDocument()
    expect(screen.queryByText('Now signed in with user Random_2533')).not.toBeInTheDocument()
    
    expect(onSuccess).toHaveBeenCalledWith(mockJwtResponse)
  })

  it('shows lifecycle details on second click', async () => {
    ;(global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockJwtResponse)
    })

    render(<JwtButton />)
    
    // First click - initial verification
    await act(async () => {
      fireEvent.click(screen.getByTestId('jwt-test-button'))
    })
    
    await waitFor(() => {
      expect(screen.getByText('Verified')).toBeInTheDocument()
    })

    // Verify lifecycle details are not shown
    expect(screen.queryByText('Created user Random_2533')).not.toBeInTheDocument()

    // Second click - show lifecycle details
    await act(async () => {
      fireEvent.click(screen.getByTestId('jwt-test-button'))
    })

    // Verify lifecycle details are now shown
    expect(screen.getByText('Created user Random_2533')).toBeInTheDocument()
    expect(screen.getByText('Now signed in with user Random_2533')).toBeInTheDocument()

    // Third click - hide lifecycle details
    await act(async () => {
      fireEvent.click(screen.getByTestId('jwt-test-button'))
    })

    // Verify lifecycle details are hidden again
    expect(screen.queryByText('Created user Random_2533')).not.toBeInTheDocument()
  })

  it('shows deletion and recreation details on second click', async () => {
    const responseWithDeletion = {
      ...mockJwtResponse,
      userLifecycle: {
        deleted: 'Random_3934',
        created: 'Random_2533',
        signedIn: 'Random_2533'
      }
    }

    ;(global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(responseWithDeletion)
    })

    render(<JwtButton />)
    
    // First click - initial verification
    await act(async () => {
      fireEvent.click(screen.getByTestId('jwt-test-button'))
    })
    
    await waitFor(() => {
      expect(screen.getByText('Verified')).toBeInTheDocument()
    })

    // Verify lifecycle details are not shown
    expect(screen.queryByText('Deleted user Random_3934')).not.toBeInTheDocument()

    // Second click - show lifecycle details
    await act(async () => {
      fireEvent.click(screen.getByTestId('jwt-test-button'))
    })

    // Verify all lifecycle details are shown
    expect(screen.getByText('Deleted user Random_3934')).toBeInTheDocument()
    expect(screen.getByText('Created user Random_2533')).toBeInTheDocument()
    expect(screen.getByText('Now signed in with user Random_2533')).toBeInTheDocument()
  })

  it('handles JWT generation without complete user lifecycle', async () => {
    const partialResponse = {
      message: ['JWT generated'],
      jwt: 'test.jwt.token',
      user: ''
    }
    
    ;(global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(partialResponse)
    })

    render(<JwtButton />)
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('jwt-test-button'))
    })

    await waitFor(() => {
      expect(screen.getByTestId('jwt-container')).toHaveClass('bg-yellow-900/20')
    })

    // Verify User Lifecycle warning state
    expect(screen.getByText('Not Verified')).toBeInTheDocument()
    const warningIcon = screen.getByText('⚠')
    expect(warningIcon).toHaveClass('text-yellow-400')

    // Second click should not show any lifecycle details
    await act(async () => {
      fireEvent.click(screen.getByTestId('jwt-test-button'))
    })
    expect(screen.queryByText('Created user')).not.toBeInTheDocument()
  })

  it('handles error during JWT test', async () => {
    const onError = vi.fn()
    const errorMessage = 'Failed to fetch'
    ;(global.fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error(errorMessage))

    render(<JwtButton />)
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('jwt-test-button'))
    })
    
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument()
    })

    expect(screen.getByTestId('jwt-container')).toHaveClass('bg-red-900/20')
    expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument()
    expect(onError).toHaveBeenCalledWith(errorMessage)
  })

  it('disables button during loading', async () => {
    ;(global.fetch as unknown as ReturnType<typeof vi.fn>).mockImplementationOnce(() => new Promise(() => {}))

    render(<JwtButton />)
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('jwt-test-button'))
    })
    
    expect(screen.getByTestId('jwt-test-button')).toBeDisabled()
  })
}) 