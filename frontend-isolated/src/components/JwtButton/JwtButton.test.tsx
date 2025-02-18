import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { JwtButton } from './JwtButton'
import { vi } from 'vitest'

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
    vi.clearAllMocks()
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
}) 