import { rest } from 'msw'

export const handlers = [
  // Basic API Message
  rest.get('/api/test', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ message: 'API is working!' })
    )
  }),

  // Health Check
  rest.get('/api/health', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        status: 'healthy',
        message: 'API is configured with Supabase',
        supabase_connected: true
      })
    )
  }),

  // JWT Token
  rest.get('/api/auth/token', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        token: 'mock.jwt.token'
      })
    )
  }),

  // Error cases
  rest.get('/api/health/error', (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        status: 'unhealthy',
        message: 'Error connecting to Supabase',
        supabase_connected: false
      })
    )
  })
] 