import { useState } from 'react'
import axios from 'axios'

export function APIHealthButton({ onSuccess, onError, className = '' }) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null)
  const [error, setError] = useState(null)

  const getContainerColor = () => {
    if (error) return 'bg-red-900/20'
    if (status?.status === 'healthy') return 'bg-green-900/20'
    if (!status) return 'bg-gray-900/20'
    return 'bg-yellow-900/20'
  }

  const getButtonColor = () => {
    if (loading) return 'bg-yellow-500'
    if (error) return 'bg-red-500'
    if (status?.status === 'healthy') return 'bg-green-500'
    if (!status) return 'bg-blue-500'
    return 'bg-yellow-500'
  }

  const handleClick = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await axios.get('/api/health/')
      setStatus(data)
      if (onSuccess) onSuccess(data)
    } catch (err) {
      let errorMessage = 'API Error'
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          errorMessage = 'API endpoint not found'
        } else if (err.response?.status === 500) {
          errorMessage = 'Internal server error'
        }
      }
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
    <div className={containerClasses} data-testid="api-health-container">
      <button 
        onClick={handleClick} 
        disabled={loading} 
        data-testid="api-health-button"
        className={buttonClasses}
      >
        Check API Health
      </button>
      {status && (
        <div data-testid="api-health-status" className="mt-4 text-white">
          <h3 className="text-xl font-bold mb-4">API Health Status:</h3>
          <div className="mb-4">
            <div className="flex items-center space-x-2">
              <span className={status.status === 'healthy' ? 'text-green-400' : 'text-yellow-400'}>
                {status.status === 'healthy' ? '✓' : '⚠'}
              </span>
              <span>Status: {status.status}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={status.supabase_connected ? 'text-green-400' : 'text-red-400'}>
                {status.supabase_connected ? '✓' : '✗'}
              </span>
              <span>Supabase Connected: {status.supabase_connected ? 'Yes' : 'No'}</span>
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