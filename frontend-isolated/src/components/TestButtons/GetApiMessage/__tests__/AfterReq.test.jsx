/// <reference types="vitest" />
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import React from 'react'
import { APIHealthButton } from '../GetSupaBaseHealthButton'
import { GetApiMessageButton } from '../GetApiMessageButton'

vi.mock('axios')

const mockHealthyResponse = {
  status: 'healthy',
  message: 'API is healthy',
  supabase_connected: true
}

const mockUnhealthyResponse = {
  status: 'unhealthy',
  message: 'Database connection failed',
  supabase_connected: false
}

describe('APIHealthButton', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renders correctly', () => {
    render(<APIHealthButton />)
    expect(screen.getByTestId('api-health-button')).toBeInTheDocument()
    expect(screen.getByTestId('api-health-button')).toHaveTextContent('Check API Health')
    expect(screen.getByTestId('api-health-container')).toHaveClass('bg-red-900/20')
  })

  it('handles successful healthy API check', async () => {
    const onSuccess = vi.fn()
    vi.mocked(axios.get).mockResolvedValueOnce({ data: mockHealthyResponse })

    render(<APIHealthButton onSuccess={onSuccess} />)
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('api-health-button'))
    })
    
    await waitFor(() => {
      expect(screen.getByTestId('api-health-status')).toBeInTheDocument()
    })

    // Verify container color
    expect(screen.getByTestId('api-health-container')).toHaveClass('bg-green-900/20')

    // Verify status content
    expect(screen.getByText('Status: healthy')).toBeInTheDocument()
    expect(screen.getByText('Supabase Connected: Yes')).toBeInTheDocument()
    expect(screen.getByText('API is healthy')).toBeInTheDocument()
    
    expect(onSuccess).toHaveBeenCalledWith(mockHealthyResponse)
  })

  it('handles unhealthy API response', async () => {
    const onSuccess = vi.fn()
    vi.mocked(axios.get).mockResolvedValueOnce({ data: mockUnhealthyResponse })

    render(<APIHealthButton onSuccess={onSuccess} />)
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('api-health-button'))
    })
    
    await waitFor(() => {
      expect(screen.getByTestId('api-health-status')).toBeInTheDocument()
    })

    // Verify container color
    expect(screen.getByTestId('api-health-container')).toHaveClass('bg-yellow-900/20')

    // Verify status content
    expect(screen.getByText('Status: unhealthy')).toBeInTheDocument()
    expect(screen.getByText('Supabase Connected: No')).toBeInTheDocument()
    expect(screen.getByText('Database connection failed')).toBeInTheDocument()
    
    expect(onSuccess).toHaveBeenCalledWith(mockUnhealthyResponse)
  })

  it('handles error during API check', async () => {
    const onError = vi.fn()
    const errorMessage = 'Failed to fetch'
    vi.mocked(axios.get).mockRejectedValueOnce(new Error(errorMessage))

    render(<APIHealthButton onError={onError} />)
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('api-health-button'))
    })
    
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument()
    })

    expect(screen.getByTestId('api-health-container')).toHaveClass('bg-red-900/20')
    const errorElement = screen.getByTestId('error-message')
    expect(errorElement.textContent).toContain(errorMessage)
    expect(onError).toHaveBeenCalledWith(errorMessage)
  })

  it('disables button during loading', async () => {
    // Create a promise that we control to keep the loading state active
    let _resolvePromise: (value: unknown) => void
    const promise = new Promise(resolve => {
      _resolvePromise = resolve
    })
    vi.mocked(axios.get).mockImplementationOnce(() => promise)

    render(<APIHealthButton />)
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('api-health-button'))
    })
    
    expect(screen.getByTestId('api-health-button')).toHaveAttribute('disabled')
  })
})

describe('GetApiMessageButton After Request', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('shows loading state while fetching', async () => {
    // Create a promise that we can control to keep the loading state active
    let resolvePromise
    const promise = new Promise(resolve => {
      resolvePromise = resolve
    })
    vi.mocked(axios.get).mockImplementationOnce(() => promise)

    render(<GetApiMessageButton />)
    
    // Click the button to start loading
    fireEvent.click(screen.getByTestId('api-message-button'))
    
    // Check loading state
    const button = screen.getByTestId('api-message-button')
    expect(button).toBeDisabled()
    expect(button).toHaveTextContent('Getting message...')
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(button).toHaveClass('bg-yellow-500')
  })

  it('displays success message after successful request', async () => {
    const mockResponse = { message: 'Api is working!' }
    vi.mocked(axios.get).mockResolvedValueOnce({ data: mockResponse })

    render(<GetApiMessageButton />)
    
    // Click the button
    fireEvent.click(screen.getByTestId('api-message-button'))
    
    // Wait for success state
    await waitFor(() => {
      expect(screen.getByTestId('api-message-status')).toBeInTheDocument()
    })

    // Check success state
    const container = screen.getByTestId('api-message-container')
    expect(container).toHaveClass('bg-green-900/20')
    
    const status = screen.getByTestId('api-message-status')
    expect(status).toHaveTextContent('Api is working!')
    expect(status).toHaveTextContent('✓')
    
    const button = screen.getByTestId('api-message-button')
    expect(button).not.toBeDisabled()
    expect(button).toHaveClass('bg-green-500')
  })

  it('displays error message after failed request', async () => {
    const errorMessage = 'API Error'
    vi.mocked(axios.get).mockRejectedValueOnce(new Error(errorMessage))

    render(<GetApiMessageButton />)
    
    // Click the button
    fireEvent.click(screen.getByTestId('api-message-button'))
    
    // Wait for error state
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument()
    })

    // Check error state
    const container = screen.getByTestId('api-message-container')
    expect(container).toHaveClass('bg-red-900/20')
    
    const error = screen.getByTestId('error-message')
    expect(error).toHaveTextContent(errorMessage)
    expect(error).toHaveTextContent('✗')
    
    const button = screen.getByTestId('api-message-button')
    expect(button).not.toBeDisabled()
    expect(button).toHaveClass('bg-red-500')
  })

  it('calls onSuccess callback with response data', async () => {
    const mockResponse = { message: 'Api is working!' }
    const onSuccess = vi.fn()
    vi.mocked(axios.get).mockResolvedValueOnce({ data: mockResponse })

    render(<GetApiMessageButton onSuccess={onSuccess} />)
    
    // Click the button
    fireEvent.click(screen.getByTestId('api-message-button'))
    
    // Wait for and verify callback
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(mockResponse)
    })
  })

  it('calls onError callback with error message', async () => {
    const errorMessage = 'API Error'
    const onError = vi.fn()
    vi.mocked(axios.get).mockRejectedValueOnce(new Error(errorMessage))

    render(<GetApiMessageButton onError={onError} />)
    
    // Click the button
    fireEvent.click(screen.getByTestId('api-message-button'))
    
    // Wait for and verify callback
    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(errorMessage)
    })
  })
}) 