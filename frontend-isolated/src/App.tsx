import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { checkApiHealth } from './services/api'

interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  message: string;
  supabase_connected: boolean;
}

interface JWTTestResponse {
  token: string;
  message: string[];
  user: string;
  jwt: string;
}

function App() {
  const [count, setCount] = useState(0)
  const [healthStatus, setHealthStatus] = useState<HealthCheckResponse | null>(null)
  const [jwtStatus, setJwtStatus] = useState<JWTTestResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleHealthCheck = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await checkApiHealth()
      setHealthStatus(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setHealthStatus(null)
    } finally {
      setLoading(false)
    }
  }

  const handleJWTTest = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/auth/test/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      setJwtStatus(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setJwtStatus(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>

      <div className="card">
        <button onClick={handleHealthCheck} disabled={loading}>
          Check API Health
        </button>
        {healthStatus && (
          <div data-testid="health-status">
            API Status: {healthStatus.status}
            <br />
            Message: {healthStatus.message}
            <br />
            Supabase Connected: {healthStatus.supabase_connected ? 'Yes' : 'No'}
          </div>
        )}
      </div>

      <div className="card">
        <button onClick={handleJWTTest} disabled={loading} data-testid="jwt-test-button">
          Test JWT
        </button>
        {jwtStatus && (
          <div data-testid="jwt-status">
            JWT Test Result: {jwtStatus.message.join(', ')}
            <br />
            User: {jwtStatus.user}
            <br />
            Token: {jwtStatus.jwt}
          </div>
        )}
      </div>

      {error && <div className="error" data-testid="error-message">{error}</div>}
    </>
  )
}

export default App
