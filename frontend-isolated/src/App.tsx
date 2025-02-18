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
          <div data-testid="jwt-status" className="mt-4 p-4 bg-emerald-950 border border-emerald-500 rounded-lg text-emerald-300">
            <div className="font-semibold mb-2">JWT Test Result:</div>
            <div className="space-y-1">
              {jwtStatus.message.map((msg, index) => (
                <div key={index} className="flex items-center">
                  <span className="text-emerald-400 mr-2">✓</span>
                  {msg}
                </div>
              ))}
              <div className="mt-2">
                <div className="font-medium">User: {jwtStatus.user}</div>
                <div className="mt-2">
                  <div className="font-medium">Token:</div>
                  <div className="text-sm break-all bg-emerald-900 p-2 rounded mt-1 text-emerald-200">
                    {jwtStatus.jwt}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && <div className="error" data-testid="error-message">{error}</div>}
    </>
  )
}

export default App
