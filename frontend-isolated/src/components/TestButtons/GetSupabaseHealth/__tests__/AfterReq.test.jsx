/// <reference types="vitest" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { APIHealthButton } from '../GetSupaBaseHealthButton'
import axios from 'axios'

vi.mock('axios')

describe('GetSupabaseHealth After Request', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('transitions to loading state', async () => {
    let resolvePromise
    const promise = new Promise(resolve => {
      resolvePromise = resolve
    })
    vi.mocked(axios.get).mockImplementationOnce(() => promise)

    render(<APIHealthButton />)
    fireEvent.click(screen.getByTestId('api-health-button'))
    
    const button = screen.getByTestId('api-health-button')
    expect(button).toBeDisabled()
  })

  it('transitions to healthy state with correct visual feedback', async () => {
    const mockResponse = {
      status: 'healthy',
      message: 'API is healthy',
      supabase_connected: true
    }
    vi.mocked(axios.get).mockResolvedValueOnce({ data: mockResponse })

    render(<APIHealthButton />)
    fireEvent.click(screen.getByTestId('api-health-button'))
    
    await waitFor(() => {
      expect(screen.getByTestId('api-health-status')).toBeInTheDocument()
    })

    // Visual state checks
    const container = screen.getByTestId('api-health-container')
    expect(container).toHaveClass('bg-green-900/20')
    
    const status = screen.getByTestId('api-health-status')
    expect(status).toHaveTextContent('✓')
    expect(status.querySelector('code')).toHaveTextContent('API is healthy')
    
    const button = screen.getByTestId('api-health-button')
    expect(button).toHaveClass('bg-green-500')
  })

  it('transitions to unhealthy state with correct visual feedback', async () => {
    const mockResponse = {
      status: 'unhealthy',
      message: 'Database connection failed',
      supabase_connected: false
    }
    vi.mocked(axios.get).mockResolvedValueOnce({ data: mockResponse })

    render(<APIHealthButton />)
    fireEvent.click(screen.getByTestId('api-health-button'))
    
    await waitFor(() => {
      expect(screen.getByTestId('api-health-status')).toBeInTheDocument()
    })

    // Visual state checks
    const container = screen.getByTestId('api-health-container')
    expect(container).toHaveClass('bg-yellow-900/20')
    
    const status = screen.getByTestId('api-health-status')
    expect(status).toHaveTextContent('⚠')
    expect(status.querySelector('code')).toHaveTextContent('Database connection failed')
    
    const button = screen.getByTestId('api-health-button')
    expect(button).toHaveClass('bg-yellow-500')
  })

  it('transitions to error state with correct visual feedback', async () => {
    const errorMessage = 'API Error'
    vi.mocked(axios.get).mockRejectedValueOnce(new Error(errorMessage))

    render(<APIHealthButton />)
    fireEvent.click(screen.getByTestId('api-health-button'))
    
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument()
    })

    // Visual state checks
    const container = screen.getByTestId('api-health-container')
    expect(container).toHaveClass('bg-red-900/20')
    
    const error = screen.getByTestId('error-message')
    expect(error).toHaveTextContent('✗')
    
    const button = screen.getByTestId('api-health-button')
    expect(button).toHaveClass('bg-red-500')
  })

  it('maintains state through callbacks', async () => {
    const mockResponse = { status: 'healthy', message: 'API is healthy', supabase_connected: true }
    const onSuccess = vi.fn()
    vi.mocked(axios.get).mockResolvedValueOnce({ data: mockResponse })

    render(<APIHealthButton onSuccess={onSuccess} />)
    fireEvent.click(screen.getByTestId('api-health-button'))
    
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(mockResponse)
      expect(screen.getByTestId('api-health-status')).toBeInTheDocument()
    })

    // Verify state persists after callback
    expect(screen.getByTestId('api-health-container')).toHaveClass('bg-green-900/20')
  })

  it('maintains error state through callbacks', async () => {
    const errorMessage = 'API Error'
    const onError = vi.fn()
    vi.mocked(axios.get).mockRejectedValueOnce(new Error(errorMessage))

    render(<APIHealthButton onError={onError} />)
    fireEvent.click(screen.getByTestId('api-health-button'))
    
    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(errorMessage)
      expect(screen.getByTestId('error-message')).toBeInTheDocument()
    })

    // Verify state persists after callback
    expect(screen.getByTestId('api-health-container')).toHaveClass('bg-red-900/20')
  })
}) 