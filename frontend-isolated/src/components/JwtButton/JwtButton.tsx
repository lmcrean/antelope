import { useState } from 'react'

export interface JwtResponse {
  message: string[];
  user: string;
  jwt: string;
}

export interface JwtButtonProps {
  onSuccess?: (response: JwtResponse) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function JwtButton({ onSuccess, onError, className = 'card' }: JwtButtonProps) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<JwtResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const getButtonColor = () => {
    if (error || !status) return 'bg-red-500'
    if (!status.user) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const handleClick = async () => {
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
      setStatus(data)
      onSuccess?.(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      onError?.(errorMessage)
      setStatus(null)
    } finally {
      setLoading(false)
    }
  }

  const buttonClasses = `${getButtonColor()} text-white font-bold py-2 px-4 rounded transition-colors`

  return (
    <div className={className}>
      <button 
        onClick={handleClick} 
        disabled={loading} 
        data-testid="jwt-test-button"
        className={buttonClasses}
      >
        Test JWT
      </button>
      {status && (
        <div data-testid="jwt-status">
          JWT Test Result:
          <br />
          {status.message.map((msg, i) => (
            <div key={i}>{msg}</div>
          ))}
          <br />
          User: {status.user}
          <br />
          Token:
          <br />
          <div className="token-wrap">{status.jwt}</div>
        </div>
      )}
      {error && (
        <div className="error" data-testid="error-message">
          Error: {error}
        </div>
      )}
    </div>
  )
} 