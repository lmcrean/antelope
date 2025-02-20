/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { checkApiHealth } from '../../../../services/api'

vi.mock('axios')

describe('GetSupabaseHealth Axios Requests', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should make a GET request to /api/health/', async () => {
    const mockResponse = {
      status: 'healthy',
      message: 'API is healthy',
      supabase_connected: true
    }
    vi.mocked(axios.get).mockResolvedValueOnce({ data: mockResponse })

    const response = await checkApiHealth()

    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/api/health/'))
    expect(response).toEqual(mockResponse)
  })

  it('should handle 404 error', async () => {
    const mockError = {
      isAxiosError: true,
      response: { status: 404 }
    }
    vi.spyOn(axios, 'isAxiosError').mockReturnValue(true)
    vi.mocked(axios.get).mockRejectedValueOnce(mockError)

    await expect(checkApiHealth()).rejects.toThrow('API endpoint not found')
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/api/health/'))
  })

  it('should handle 500 error', async () => {
    const mockError = {
      isAxiosError: true,
      response: { status: 500 }
    }
    vi.spyOn(axios, 'isAxiosError').mockReturnValue(true)
    vi.mocked(axios.get).mockRejectedValueOnce(mockError)

    await expect(checkApiHealth()).rejects.toThrow('Internal server error')
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/api/health/'))
  })

  it('should handle non-axios error', async () => {
    vi.spyOn(axios, 'isAxiosError').mockReturnValue(false)
    vi.mocked(axios.get).mockRejectedValueOnce(new Error('Network error'))

    await expect(checkApiHealth()).rejects.toThrow('Failed to check API health')
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/api/health/'))
  })
})
