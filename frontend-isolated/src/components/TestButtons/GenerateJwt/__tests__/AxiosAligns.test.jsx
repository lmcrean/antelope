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
    
    expect(axios.get).toHaveBeenCalledWith('/api/auth/token/')
  })

  it('should match API isolation pattern for auth endpoints', () => {
    render(<GenerateJWTButton />)
    fireEvent.click(screen.getByRole('button'))
    
    const [[url]] = vi.mocked(axios.get).mock.calls
    expect(url).toMatch(/^\/api\/[^\/]+\/[^\/]+\/$/)
  })

  it('should use consistent auth service prefix', () => {
    render(<GenerateJWTButton />)
    fireEvent.click(screen.getByRole('button'))
    
    const [[url]] = vi.mocked(axios.get).mock.calls
    expect(url).toMatch(/^\/api\/auth\//)
  })

  it('should not include request body', () => {
    render(<GenerateJWTButton />)
    fireEvent.click(screen.getByRole('button'))
    
    expect(axios.get).toHaveBeenCalledWith('/api/auth/token/')
  })

  it('should use GET method consistently', () => {
    render(<GenerateJWTButton />)
    fireEvent.click(screen.getByRole('button'))
    
    expect(axios.get).toHaveBeenCalled()
    expect(axios.post).not.toHaveBeenCalled()
    expect(axios.put).not.toHaveBeenCalled()
  })
}) 