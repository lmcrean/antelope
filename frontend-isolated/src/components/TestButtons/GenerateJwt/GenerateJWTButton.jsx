import { useState } from 'react'
import axios from 'axios'

export function GenerateJWTButton({ onSuccess, onError, className = '' }) {
  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState(null)
  const [error, setError] = useState(null)

  const handleClick = async () => {
    setLoading(true)
    setError(null)
    setToken(null)
    
    try {
      const { data } = await axios.post('/api/auth/generate-jwt')
      setToken(data.token)
      if (onSuccess) onSuccess(data)
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred'
      setError(errorMessage)
      if (onError) onError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const buttonClasses = `bg-blue-500 text-white font-bold py-2 px-4 rounded transition-colors`
  const containerClasses = `p-6 rounded-lg transition-colors duration-300 ${className}`

  return (
    <div className={containerClasses} data-testid="jwt-container">
      <button 
        onClick={handleClick} 
        disabled={loading}
        className={buttonClasses}
      >
        Generate JWT
      </button>
      {token && (
        <div className="mt-4 text-white">
          <h3 className="text-xl font-bold mb-2">Token:</h3>
          <div className="bg-black/30 p-3 rounded">
            <code className="text-sm break-all">{token}</code>
          </div>
        </div>
      )}
      {error && (
        <div className="mt-4 text-red-400">
          <span className="text-red-400">✗</span> Error: {error}
        </div>
      )}
    </div>
  )
} 