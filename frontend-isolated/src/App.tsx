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

interface UserResponse {
  message: string;
  user?: {
    username: string;
    email: string;
  };
  error?: string;
}

function App() {
  const [count, setCount] = useState(0)
  const [healthStatus, setHealthStatus] = useState<HealthCheckResponse | null>(null)
  const [jwtStatus, setJwtStatus] = useState<JWTTestResponse | null>(null)
  const [userStatus, setUserStatus] = useState<UserResponse | null>(null)
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

  const handleUserSignup = async () => {
    setLoading(true)
    setError(null)
    try {
      // If we have an existing user, delete them first
      if (userStatus?.user?.email) {
        const deleteResponse = await fetch('/api/auth/delete/', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: userStatus.user.email
          })
        });
        if (!deleteResponse.ok) {
          throw new Error('Failed to delete existing user');
        }
      }

      // Create new user
      const response = await fetch('/api/auth/signup/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to create user');
      }

      const data = await response.json();
      setUserStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setUserStatus(null);
    } finally {
      setLoading(false);
    }
  };

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
            JWT Test Result:
            <br />
            {jwtStatus.message.map((msg, i) => (
              <div key={i}>{msg}</div>
            ))}
            <br />
            User: {jwtStatus.user}
            <br />
            Token:
            <br />
            <div className="token-wrap">{jwtStatus.jwt}</div>
          </div>
        )}
      </div>

      <div className="card">
        <button onClick={handleUserSignup} disabled={loading}>
          Sign Up
        </button>
        {userStatus && (
          <div data-testid="user-status">
            {userStatus.message}
            {userStatus.user && (
              <>
                <br />
                Username: {userStatus.user.username}
                <br />
                Email: {userStatus.user.email}
              </>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="error" data-testid="error-message">
          Error: {error}
        </div>
      )}
    </>
  )
}

export default App
