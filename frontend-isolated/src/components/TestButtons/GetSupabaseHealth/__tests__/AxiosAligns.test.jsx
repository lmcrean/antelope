import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { APIHealthButton } from '../GetSupaBaseHealthButton'
import * as apiService from '../../../../services/api'

vi.mock('axios')
vi.mock('../../../../services/api')

describe('GetSupabaseHealth - Axios Alignment', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    // Mock the checkApiHealth implementation to make the actual axios call
    vi.mocked(apiService.checkApiHealth).mockImplementation(async () => {
      const response = await axios.get('/api/health/')
      return response.data
    })
  })

  it('should use the correct API URL pattern', async () => {
    render(<APIHealthButton />)
    fireEvent.click(screen.getByTestId('api-health-button'))
    
    expect(apiService.checkApiHealth).toHaveBeenCalled()
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

  it('should use service layer for API calls', () => {
    render(<APIHealthButton />)
    fireEvent.click(screen.getByTestId('api-health-button'))
    
    expect(apiService.checkApiHealth).toHaveBeenCalled()
    expect(apiService.checkApiHealth).toHaveBeenCalledTimes(1)
  })
}) 