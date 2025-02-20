import { useState } from 'react'
import axios from 'axios'

export function UserLifecycleButton({ onSuccess, onError, className = '' }) {
  const [loading, setLoading] = useState(false)
  const [userData, setUserData] = useState(null)
  const [error, setError] = useState(null)

  const generateTestUser = () => ({
    email: `test${Date.now()}@example.com`,
    password: `Test${Date.now()}!123`
  })

  const handleClick = async () => {
    setLoading(true)
    setError(null)
    setUserData(null)
    
    try {
      const testUser = generateTestUser()
      const { data } = await axios.post('/api/auth/create-user', testUser)
      setUserData(data)
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
    <div className={containerClasses} data-testid="user-lifecycle-container">
      <button 
        onClick={handleClick} 
        disabled={loading}
        className={buttonClasses}
      >
        Create Test User
      </button>
      {userData && (
        <div className="mt-4 text-white">
          <h3 className="text-xl font-bold mb-2">User Created:</h3>
          <div className="bg-black/30 p-3 rounded">
            <div className="mb-2">
              <strong>ID:</strong> {userData.user.id}
            </div>
            <div className="mb-2">
              <strong>Email:</strong> {userData.user.email}
            </div>
            <div className="mb-2">
              <strong>Status:</strong> {userData.user.status}
            </div>
            <div>
              <strong>Created At:</strong> {new Date(userData.user.created_at).toLocaleString()}
            </div>
          </div>
          <h4 className="text-lg font-bold mt-4 mb-2">Session Info:</h4>
          <div className="bg-black/30 p-3 rounded">
            <div className="mb-2">
              <strong>Session ID:</strong> {userData.session.id}
            </div>
            <div>
              <strong>Expires At:</strong> {new Date(userData.session.expires_at).toLocaleString()}
            </div>
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