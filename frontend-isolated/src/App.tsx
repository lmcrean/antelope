import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { JwtButton } from './components/TestButtons/JwtButton/JwtTestButton'
import { APIHealthButton } from './components/TestButtons/APIHealth/APIHealthButton'

interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  message: string;
  supabase_connected: boolean;
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
        <APIHealthButton />
      </div>

      <JwtButton />

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
