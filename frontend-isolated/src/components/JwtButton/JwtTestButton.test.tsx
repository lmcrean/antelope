/// <reference types="vitest" />
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { JwtTestButton } from './JwtTestButton'

const mockJwtResponse = {
  message: [
    'Success: generated JWT token',
    'Success: token has service role permissions'
  ],
  user: 'service_role',
  jwt: 'mock.jwt.token'
}

describe('JwtTestButton', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    global.fetch = vi.fn()
  })

  it('renders correctly', () => {
    render(<JwtTestButton />)
    expect(screen.getByTestId('jwt-test-button')).toBeInTheDocument()
    expect(screen.getByTestId('jwt-test-button')).toHaveTextContent('Test JWT')
    expect(screen.getByTestId('jwt-test-container')).toHaveClass('bg-red-900/20')
  })

  it('handles successful JWT test', async () => {
    const onSuccess = vi.fn()
    ;(global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockJwtResponse)
    })

    render(<JwtTestButton onSuccess={onSuccess} />)
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('jwt-test-button'))
    })
    
    await waitFor(() => {
      expect(screen.getByTestId('jwt-test-status')).toBeInTheDocument()
    })

    // Verify container color
    expect(screen.getByTestId('jwt-test-container')).toHaveClass('bg-green-900/20')

    // Verify JWT Generation section with token
    mockJwtResponse.message.forEach(msg => {
      const msgElement = screen.getByText(msg)
      expect(msgElement).toBeInTheDocument()
      expect(msgElement.previousElementSibling).toHaveClass('text-green-400')
    })
    expect(screen.getByText('mock.jwt.token')).toBeInTheDocument()
    
    expect(onSuccess).toHaveBeenCalledWith(mockJwtResponse)
  })

  it('handles error during JWT test', async () => {
    const onError = vi.fn()
    const errorMessage = 'Failed to fetch'
    ;(global.fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error(errorMessage))

    render(<JwtTestButton onError={onError} />)
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('jwt-test-button'))
    })
    
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument()
    })

    expect(screen.getByTestId('jwt-test-container')).toHaveClass('bg-red-900/20')
    expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument()
    expect(onError).toHaveBeenCalledWith(errorMessage)
  })

  it('disables button during loading', async () => {
    ;(global.fetch as unknown as ReturnType<typeof vi.fn>).mockImplementationOnce(() => new Promise(() => {}))

    render(<JwtTestButton />)
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('jwt-test-button'))
    })
    
    expect(screen.getByTestId('jwt-test-button')).toBeDisabled()
  })
}) 