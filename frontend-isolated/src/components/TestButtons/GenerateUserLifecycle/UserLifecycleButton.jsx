import { useState } from 'react'
import axios from 'axios'

export function UserLifecycleButton({ onSuccess, onError, className = '' }) {
  const [loading, setLoading] = useState(false)
  const [lifecycleData, setLifecycleData] = useState(null)
  const [error, setError] = useState(null)
  const [testUser, setTestUser] = useState(null)

  const generateTestUser = () => ({
    username: `testuser${Date.now()}`,
    password: `Test${Date.now()}!123`
  })

  const handleClick = async () => {
    setLoading(true)
    setError(null)
    setLifecycleData(null)
    
    try {
      const newTestUser = generateTestUser()
      setTestUser(newTestUser)
      // Using test-token for development - this should be replaced with proper JWT in production
      const { data } = await axios.post('/api/auth/test-user-lifecycle', newTestUser, {
        headers: {
          'Authorization': 'Bearer test-token'
        }
      })
      setLifecycleData(data)
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
        Test User Lifecycle
      </button>
      {testUser && lifecycleData && (
        <div className="mt-4 text-white">
          <h3 className="text-xl font-bold mb-2">Lifecycle Test Results:</h3>
          <div className="bg-black/30 p-3 rounded">
            <div className="mb-2">
              <strong>Test Username:</strong> {testUser.username}
            </div>
            <div className="mb-2">
              <strong>Message:</strong> {lifecycleData.message}
            </div>
            <div className="mb-2">
              <strong>Signup:</strong> {lifecycleData.details.signup}
            </div>
            <div className="mb-2">
              <strong>Sign In:</strong> {lifecycleData.details.signin}
            </div>
            <div>
              <strong>Delete:</strong> {lifecycleData.details.delete}
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