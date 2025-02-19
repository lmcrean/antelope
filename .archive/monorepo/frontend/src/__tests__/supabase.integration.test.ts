import { describe, it, expect } from 'vitest'
import axios from 'axios'

// Only run these tests if Supabase credentials are available
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY

describe('Supabase Integration', () => {
  it('should successfully connect to Supabase through the health endpoint', async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/health/')
      expect(response.status).toBe(200)
      expect(response.data).toEqual(
        expect.objectContaining({
          status: 'healthy',
          supabase_connected: true
        })
      )
    } catch (error) {
      // Log detailed error for debugging but don't expose sensitive info
      console.error('Supabase connection test failed:', error instanceof Error ? error.message : 'Unknown error')
      throw error
    }
  })

  it('should have required Supabase environment variables', () => {
    expect(SUPABASE_URL).toBeDefined()
    expect(SUPABASE_URL).toMatch(/^https:\/\/[a-zA-Z0-9-]+\.supabase\.co$/)
    expect(SUPABASE_KEY).toBeDefined()
    expect(SUPABASE_KEY).toMatch(/^eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/) // JWT format
  })
}) 