import { useState } from 'react'
import axios from 'axios'

export function JwtTestButton({ onSuccess, onError, className = '' }) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null)
  const [error, setError] = useState(null)

  const getContainerColor = () => {
    if (error) return 'bg-red-900/20'
    if (!status) return 'bg-red-900/20'
    return status.status === 'healthy' ? 'bg-green-900/20' : 'bg-yellow-900/20'
  }

  const getButtonColor = () => {
    if (error) return 'bg-red-500'
    if (!status) return 'bg-red-500'
    return status.status === 'healthy' ? 'bg-green-500' : 'bg-yellow-500'
  }

  const handleClick = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await axios.get('/api/test/jwt')
      setStatus(data)
      if (onSuccess) onSuccess(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      if (onError) onError(errorMessage)
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
          <h3 className="text-xl font-bold mb-4">JWT Test Status:</h3>
          <div className="mb-4">
            <div className="flex items-center space-x-2">
              <span className={status.status === 'healthy' ? 'text-green-400' : 'text-yellow-400'}>
                {status.status === 'healthy' ? '✓' : '⚠'}
              </span>
              <span>Status: {status.status}</span>
            </div>
            {status.message && (
              <div className="mt-2 bg-black/30 p-3 rounded">
                <code className="text-sm break-all">{status.message}</code>
              </div>
            )}
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