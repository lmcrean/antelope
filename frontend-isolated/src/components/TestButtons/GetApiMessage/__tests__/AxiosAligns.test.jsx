import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { GetApiMessageButton } from '../GetApiMessageButton'

vi.mock('axios')

describe('GetApiMessageButton - Axios Alignment', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should use the correct API URL pattern', async () => {
    render(<GetApiMessageButton />)
    fireEvent.click(screen.getByTestId('api-message-button'))
    
    const [[url]] = vi.mocked(axios.get).mock.calls
    expect(url).toBe('/api/test/')
  })

  it('should match API isolation pattern for test endpoints', () => {
    render(<GetApiMessageButton />)
    fireEvent.click(screen.getByTestId('api-message-button'))
    
    const [[url]] = vi.mocked(axios.get).mock.calls
    expect(url).toMatch(/^\/api\/[^\/]+\/$/)
  })

  it('should use consistent test service prefix', () => {
    render(<GetApiMessageButton />)
    fireEvent.click(screen.getByTestId('api-message-button'))
    
    const [[url]] = vi.mocked(axios.get).mock.calls
    expect(url).toMatch(/^\/api\/test\//)
  })

  it('should not include query parameters', () => {
    render(<GetApiMessageButton />)
    fireEvent.click(screen.getByTestId('api-message-button'))
    
    const [[url]] = vi.mocked(axios.get).mock.calls
    expect(url).not.toContain('?')
  })

  it('should use GET method consistently', () => {
    render(<GetApiMessageButton />)
    fireEvent.click(screen.getByTestId('api-message-button'))
    
    expect(axios.get).toHaveBeenCalled()
    expect(axios.post).not.toHaveBeenCalled()
    expect(axios.put).not.toHaveBeenCalled()
    expect(axios.delete).not.toHaveBeenCalled()
  })

  it('should align with backend API route', () => {
    render(<GetApiMessageButton />)
    fireEvent.click(screen.getByTestId('api-message-button'))
    
    const [[url]] = vi.mocked(axios.get).mock.calls
    // This should match the Django URL pattern in api_app/urls.py
    expect(url).toBe('/api/test/')
  })
}) 