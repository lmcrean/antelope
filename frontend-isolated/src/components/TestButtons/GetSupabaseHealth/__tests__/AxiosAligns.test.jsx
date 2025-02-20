import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { APIHealthButton } from '../GetSupaBaseHealthButton'

vi.mock('axios')

describe('GetSupabaseHealth - Axios Alignment', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should use the correct API URL pattern', async () => {
    render(<APIHealthButton />)
    fireEvent.click(screen.getByTestId('api-health-button'))
    
    expect(axios.get).toHaveBeenCalledWith('/api/health/')
  })

  it('should match API isolation pattern for health endpoints', () => {
    render(<APIHealthButton />)
    fireEvent.click(screen.getByTestId('api-health-button'))
    
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringMatching(/^\/api\/[^\/]+\/$/)
    )
  })

  it('should use consistent health service name', () => {
    render(<APIHealthButton />)
    fireEvent.click(screen.getByTestId('api-health-button'))
    
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringMatching(/^\/api\/health\//)
    )
  })

  it('should include trailing slash for Django compatibility', () => {
    render(<APIHealthButton />)
    fireEvent.click(screen.getByTestId('api-health-button'))
    
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringMatching(/\/$/)
    )
  })

  it('should use GET method consistently', () => {
    render(<APIHealthButton />)
    fireEvent.click(screen.getByTestId('api-health-button'))
    
    expect(axios.get).toHaveBeenCalled()
    expect(axios.post).not.toHaveBeenCalled()
    expect(axios.put).not.toHaveBeenCalled()
    expect(axios.delete).not.toHaveBeenCalled()
  })

  it('should align with backend API route', () => {
    render(<APIHealthButton />)
    fireEvent.click(screen.getByTestId('api-health-button'))
    
    expect(axios.get).toHaveBeenCalledWith('/api/health/')
  })
}) 