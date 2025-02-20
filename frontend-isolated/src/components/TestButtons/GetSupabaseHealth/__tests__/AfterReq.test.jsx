/// <reference types="vitest" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { APIHealthButton } from '../GetSupaBaseHealthButton'
import { checkApiHealth } from '../../../../services/api'

vi.mock('../../../../services/api')

describe('GetSupabaseHealth After Request', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('shows loading state while fetching', async () => {
    // Create a promise that we can control to keep the loading state active
    let resolvePromise
    const promise = new Promise(resolve => {
      resolvePromise = resolve
    })
    vi.mocked(checkApiHealth).mockImplementationOnce(() => promise)

    render(<APIHealthButton />)
    
    // Click the button to start loading
    fireEvent.click(screen.getByTestId('api-health-button'))
    
    // Check loading state
    const button = screen.getByTestId('api-health-button')
    expect(button).toBeDisabled()
  })

  it('displays healthy status after successful request', async () => {
    const mockResponse = {
      status: 'healthy',
      message: 'API is healthy',
      supabase_connected: true
    }
    vi.mocked(checkApiHealth).mockResolvedValueOnce(mockResponse)

    render(<APIHealthButton />)
    
    // Click the button
    fireEvent.click(screen.getByTestId('api-health-button'))
    
    // Wait for success state
    await waitFor(() => {
      expect(screen.getByTestId('api-health-status')).toBeInTheDocument()
    })

    // Check success state
    const container = screen.getByTestId('api-health-container')
    expect(container).toHaveClass('bg-green-900/20')
    
    const status = screen.getByTestId('api-health-status')
    expect(status).toHaveTextContent('Status: healthy')
    expect(status).toHaveTextContent('Supabase Connected: Yes')
    expect(status).toHaveTextContent('API is healthy')
    
    const button = screen.getByTestId('api-health-button')
    expect(button).not.toBeDisabled()
    expect(button).toHaveClass('bg-green-500')
  })

  it('displays unhealthy status after unhealthy response', async () => {
    const mockResponse = {
      status: 'unhealthy',
      message: 'Database connection failed',
      supabase_connected: false
    }
    vi.mocked(checkApiHealth).mockResolvedValueOnce(mockResponse)

    render(<APIHealthButton />)
    
    // Click the button
    fireEvent.click(screen.getByTestId('api-health-button'))
    
    // Wait for status
    await waitFor(() => {
      expect(screen.getByTestId('api-health-status')).toBeInTheDocument()
    })

    // Check unhealthy state
    const container = screen.getByTestId('api-health-container')
    expect(container).toHaveClass('bg-yellow-900/20')
    
    const status = screen.getByTestId('api-health-status')
    expect(status).toHaveTextContent('Status: unhealthy')
    expect(status).toHaveTextContent('Supabase Connected: No')
    expect(status).toHaveTextContent('Database connection failed')
    
    const button = screen.getByTestId('api-health-button')
    expect(button).not.toBeDisabled()
    expect(button).toHaveClass('bg-yellow-500')
  })

  it('displays error message after failed request', async () => {
    const errorMessage = 'Failed to check API health'
    vi.mocked(checkApiHealth).mockRejectedValueOnce(new Error(errorMessage))

    render(<APIHealthButton />)
    
    // Click the button
    fireEvent.click(screen.getByTestId('api-health-button'))
    
    // Wait for error state
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument()
    })

    // Check error state
    const container = screen.getByTestId('api-health-container')
    expect(container).toHaveClass('bg-red-900/20')
    
    const error = screen.getByTestId('error-message')
    expect(error).toHaveTextContent(errorMessage)
    expect(error).toHaveTextContent('✗')
    
    const button = screen.getByTestId('api-health-button')
    expect(button).not.toBeDisabled()
    expect(button).toHaveClass('bg-red-500')
  })

  it('calls onSuccess callback with response data', async () => {
    const mockResponse = {
      status: 'healthy',
      message: 'API is healthy',
      supabase_connected: true
    }
    const onSuccess = vi.fn()
    vi.mocked(checkApiHealth).mockResolvedValueOnce(mockResponse)

    render(<APIHealthButton onSuccess={onSuccess} />)
    
    // Click the button
    fireEvent.click(screen.getByTestId('api-health-button'))
    
    // Wait for and verify callback
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(mockResponse)
    })
  })

  it('calls onError callback with error message', async () => {
    const errorMessage = 'Failed to check API health'
    const onError = vi.fn()
    vi.mocked(checkApiHealth).mockRejectedValueOnce(new Error(errorMessage))

    render(<APIHealthButton onError={onError} />)
    
    // Click the button
    fireEvent.click(screen.getByTestId('api-health-button'))
    
    // Wait for and verify callback
    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(errorMessage)
    })
  })
}) 