import { useState } from 'react'
import axios from 'axios'

export interface JwtTestResponse {
  message: string[];
  user: string;
  jwt: string;
}

export interface JwtTestButtonProps {
  onSuccess?: (response: JwtTestResponse) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function JwtTestButton({ onSuccess, onError, className = '' }: JwtTestButtonProps) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<JwtTestResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const getContainerColor = () => {
    if (error || !status) return 'bg-red-900/20'
    if (!status.user) return 'bg-yellow-900/20'
    return 'bg-green-900/20'
  }

  const getButtonColor = () => {
    if (error || !status) return 'bg-red-500'
    if (!status.user) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const handleClick = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.post('/api/auth/test/')
      const data = response.data
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
  const containerClasses = `${getContainerColor()} p-6 rounded-lg transition-colors duration-300 ${className}`

  return (
    <div className={containerClasses} data-testid="jwt-test-container">
      <button 
        onClick={handleClick} 
        disabled={loading} 
        data-testid="jwt-test-button"
        className={buttonClasses}
      >
        Test JWT
      </button>
      {status && (
        <div data-testid="jwt-test-status" className="mt-4 text-white">
          <h3 className="text-xl font-bold mb-4">JWT Test Result:</h3>
          
          <div className="mb-4">
            <h4 className="font-semibold mb-2">JWT Generation:</h4>
            {status.message.map((msg, i) => (
              <div key={i} className="flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span>{msg}</span>
              </div>
            ))}
            <div className="mt-2 bg-black/30 p-3 rounded overflow-x-auto">
              <code className="text-sm break-all">{status.jwt}</code>
            </div>
          </div>
        </div>
      )}
      {error && (
        <div className="mt-4 text-red-400" data-testid="error-message">
          <span className="text-red-400">✗</span> Error: {error}
        </div>
      )}
    </div>
  )
} 