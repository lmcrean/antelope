import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { GenerateJWTButton } from '../GenerateJWTButton'

vi.mock('axios')

describe('GenerateJWTButton - Axios Alignment', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should use the correct API URL pattern', async () => {
    render(<GenerateJWTButton />)
    fireEvent.click(screen.getByRole('button'))
    
    const [[url]] = vi.mocked(axios.post).mock.calls
    expect(url).toBe('/api/auth/generate-jwt')
  })

  it('should match API isolation pattern for auth endpoints', () => {
    render(<GenerateJWTButton />)
    fireEvent.click(screen.getByRole('button'))
    
    const [[url]] = vi.mocked(axios.post).mock.calls
    expect(url).toMatch(/^\/api\/[^\/]+\/[^\/]+$/)
  })

  it('should use consistent auth service prefix', () => {
    render(<GenerateJWTButton />)
    fireEvent.click(screen.getByRole('button'))
    
    const [[url]] = vi.mocked(axios.post).mock.calls
    expect(url).toMatch(/^\/api\/auth\//)
  })

  it('should not include request body', () => {
    render(<GenerateJWTButton />)
    fireEvent.click(screen.getByRole('button'))
    
    const [, requestData] = vi.mocked(axios.post).mock.lastCall || []
    expect(requestData).toBeUndefined()
  })

  it('should use POST method consistently', () => {
    render(<GenerateJWTButton />)
    fireEvent.click(screen.getByRole('button'))
    
    expect(axios.post).toHaveBeenCalled()
    expect(axios.get).not.toHaveBeenCalled()
    expect(axios.put).not.toHaveBeenCalled()
    expect(axios.delete).not.toHaveBeenCalled()
  })
}) 