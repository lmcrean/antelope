import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'

vi.mock('axios')

describe('GetApiMessage Axios Requests', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })
  
  it('should make a GET request to /api/test/message', async () => {
    const mockResponse = { message: 'Api is working!' }
    vi.mocked(axios.get).mockResolvedValueOnce({ data: mockResponse })

    const response = await axios.get('/api/test/message')
    
    expect(axios.get).toHaveBeenCalledWith('/api/test/message')
    expect(response.data).toEqual(mockResponse)
  })

  it('should handle API error', async () => {
    const errorMessage = 'API Error'
    vi.mocked(axios.get).mockRejectedValueOnce(new Error(errorMessage))

    await expect(axios.get('/api/test/message')).rejects.toThrow(errorMessage)
    expect(axios.get).toHaveBeenCalledWith('/api/test/message')
  })
})
