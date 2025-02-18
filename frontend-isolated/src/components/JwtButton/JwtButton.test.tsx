/// <reference types="vitest" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { JwtButton } from './JwtButton'

const mockJwtResponse = {
  message: [
    'Success: generated JWT token',
    'Success: token has service role permissions'
  ],
  user: 'service_role',
  jwt: 'mock.jwt.token'
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
  })

  it('handles successful JWT test', async () => {
    const onSuccess = vi.fn()
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockJwtResponse)
    })

    render(<JwtButton onSuccess={onSuccess} />)
    
    fireEvent.click(screen.getByTestId('jwt-test-button'))
    
    await waitFor(() => {
      expect(screen.getByTestId('jwt-status')).toBeInTheDocument()
    })

    const statusElement = screen.getByTestId('jwt-status')
    expect(statusElement).toHaveTextContent('JWT Test Result:')
    expect(statusElement).toHaveTextContent('Success: generated JWT token')
    expect(statusElement).toHaveTextContent('Success: token has service role permissions')
    expect(statusElement).toHaveTextContent('User: service_role')
    expect(statusElement).toHaveTextContent('mock.jwt.token')
    expect(onSuccess).toHaveBeenCalledWith(mockJwtResponse)
  })

  it('handles error during JWT test', async () => {
    const onError = vi.fn()
    const errorMessage = 'Failed to fetch'
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error(errorMessage))

    render(<JwtButton onError={onError} />)
    
    fireEvent.click(screen.getByTestId('jwt-test-button'))
    
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument()
    })

    expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument()
    expect(onError).toHaveBeenCalledWith(errorMessage)
  })

  it('disables button during loading', async () => {
    ;(global.fetch as jest.Mock).mockImplementationOnce(() => new Promise(() => {})) // Never resolves

    render(<JwtButton />)
    
    const button = screen.getByTestId('jwt-test-button')
    fireEvent.click(button)
    
    expect(button).toBeDisabled()
  })

  it('should be red when no JWT and no user lifecycle', async () => {
    // Mock fetch to simulate error state
    global.fetch = vi.fn().mockRejectedValue(new Error('Failed to connect'))

    render(<JwtButton />)
    const button = screen.getByTestId('jwt-test-button')
    
    // Button should have red background initially
    expect(button).toHaveClass('bg-red-500')
    
    // Click button and verify it stays red after error
    await fireEvent.click(button)
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument()
      expect(button).toHaveClass('bg-red-500')
    })
  })

  it('should be yellow when JWT generates but no user lifecycle', async () => {
    // Mock fetch to return JWT but no user data
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({
        message: ['JWT generated'],
        jwt: 'test.jwt.token',
        user: '' // No user indicates incomplete lifecycle
      })
    })

    render(<JwtButton />)
    const button = screen.getByTestId('jwt-test-button')
    
    // Button should start red
    expect(button).toHaveClass('bg-red-500')
    
    // Click button and verify it turns yellow
    await fireEvent.click(button)
    await waitFor(() => {
      expect(button).toHaveClass('bg-yellow-500')
      expect(screen.getByTestId('jwt-status')).toBeInTheDocument()
    })
  })

  it('should be green when both JWT and user lifecycle are complete', async () => {
    // Mock fetch to return both JWT and user data
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({
        message: ['JWT generated', 'User lifecycle complete'],
        jwt: 'test.jwt.token',
        user: 'test@example.com'
      })
    })

    render(<JwtButton />)
    const button = screen.getByTestId('jwt-test-button')
    
    // Button should start red
    expect(button).toHaveClass('bg-red-500')
    
    // Click button and verify it turns green
    await fireEvent.click(button)
    await waitFor(() => {
      expect(button).toHaveClass('bg-green-500')
      expect(screen.getByTestId('jwt-status')).toBeInTheDocument()
    })
  })
}) 