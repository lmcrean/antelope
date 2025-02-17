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

function App() {
  const [count, setCount] = useState(0)
  const [healthStatus, setHealthStatus] = useState<HealthCheckResponse | null>(null)
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
        <button 
          onClick={handleHealthCheck}
          disabled={loading}
          style={{ marginTop: '2rem' }}
        >
          Check API Health
        </button>

        {loading && <p>Checking API health...</p>}
        
        {error && (
          <p style={{ color: 'red' }} data-testid="health-status">
            API Status: unhealthy - {error}
          </p>
        )}
        
        {healthStatus && (
          <div data-testid="health-status">
            <p>API Status: {healthStatus.status}</p>
            <p>{healthStatus.message}</p>
            <p>Supabase Connection: {healthStatus.supabase_connected ? 'Connected' : 'Disconnected'}</p>
          </div>
        )}
      </div>

      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
