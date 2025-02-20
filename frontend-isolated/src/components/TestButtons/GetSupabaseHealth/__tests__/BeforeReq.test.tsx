/// <reference types="vitest" />
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import React from 'react'
import { APIHealthButton } from '../GetSupaBaseHealthButton'

vi.mock('axios')

const mockHealthyResponse = {
  status: 'healthy' as const,
  message: 'API is healthy',
  supabase_connected: true
}

const mockUnhealthyResponse = {
  status: 'unhealthy' as const,
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