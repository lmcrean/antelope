import { useState } from 'react'
import { getApiMessage } from '../../../services/api'

export function GetApiMessageButton({ onSuccess, onError, className = '' }) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null)
  const [error, setError] = useState(null)

  const getContainerColor = () => {
    if (error) return 'bg-red-900/20'
    if (status) return 'bg-green-900/20'
    return 'bg-gray-900/20'
  }

  const getButtonColor = () => {
    if (loading) return 'bg-yellow-500'
    if (error) return 'bg-red-500'
    if (status) return 'bg-green-500'
    return 'bg-blue-500'
  }

  const handleClick = async () => {
    if (loading) return
    setLoading(true)
    setError(null)
    setStatus(null)
    try {
      const data = await getApiMessage()
      setStatus(data)
      if (onSuccess) onSuccess(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      if (onError) onError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const buttonClasses = `${getButtonColor()} text-white font-bold py-2 px-4 rounded transition-colors`
  const containerClasses = `${getContainerColor()} p-6 rounded-lg transition-colors duration-300 ${className}`

  return (
    <div className={containerClasses} data-testid="api-message-container">
      <button 
        onClick={handleClick} 
        disabled={loading} 
        data-testid="api-message-button"
        className={buttonClasses}
        aria-busy={loading}
      >
        {loading ? 'Getting message...' : 'Get API Message'}
      </button>
      {status && (
        <div data-testid="api-message-status" className="mt-4 text-white">
          <h3 className="text-xl font-bold mb-4">API Message:</h3>
          <div className="mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-green-400">✓</span>
              <span>{status.message}</span>
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
