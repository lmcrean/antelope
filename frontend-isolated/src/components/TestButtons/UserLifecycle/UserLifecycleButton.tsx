import { useState, useCallback } from 'react'
import axios from 'axios'

export interface UserLifecycleResponse {
  message: string[];
  user: string;
  userLifecycle: {
    deleted?: string;
    created?: string;
    signedIn?: string;
    error?: string;
  };
}

export interface UserLifecycleButtonProps {
  onSuccess?: (response: UserLifecycleResponse) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function UserLifecycleButton({ onSuccess, onError, className = '' }: UserLifecycleButtonProps) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<UserLifecycleResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const getContainerColor = () => {
    if (error) return 'bg-red-900/20'
    if (!status?.userLifecycle) return 'bg-gray-900/20'
    if (status.userLifecycle.error) return 'bg-red-900/20'
    if (status.userLifecycle.deleted) return 'bg-green-900/20'
    return 'bg-yellow-900/20'
  }

  const getButtonColor = () => {
    if (loading) return 'bg-yellow-500'
    if (error) return 'bg-red-500'
    if (!status?.userLifecycle) return 'bg-blue-500'
    if (status.userLifecycle.error) return 'bg-red-500'
    if (status.userLifecycle.deleted) return 'bg-green-500'
    return 'bg-yellow-500'
  }

  const handleClick = useCallback(async () => {
    if (loading) return
    setLoading(true)
    setError(null)
    setStatus(null)
    try {
      const response = await axios.post('/api/auth/test/')
      const data = response.data
      setStatus(data)
      onSuccess?.(data)
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'An error occurred'
      setError(errorMessage)
      onError?.(errorMessage)
      setStatus({
        message: ['Error occurred during user lifecycle test'],
        user: '',
        userLifecycle: {
          error: errorMessage
        }
      })
    } finally {
      setLoading(false)
    }
  }, [loading, onSuccess, onError])

  const buttonClasses = `${getButtonColor()} text-white font-bold py-2 px-4 rounded transition-colors`
  const containerClasses = `${getContainerColor()} p-6 rounded-lg transition-colors duration-300 ${className}`

  return (
    <div className={containerClasses} data-testid="user-lifecycle-container">
      <button 
        onClick={handleClick} 
        disabled={loading} 
        data-testid="user-lifecycle-button"
        className={buttonClasses}
        aria-busy={loading}
      >
        {loading ? 'Testing...' : 'Sign Up'}
      </button>
      {(status || error) && (
        <div data-testid="user-lifecycle-status" className="mt-4 text-white">
          <h3 className="text-xl font-bold mb-4">User Lifecycle Test Result:</h3>
          
          <div className="mb-4">
            <h4 className="font-semibold mb-2">User Lifecycle:</h4>
            <div className="space-y-1">
              {status?.userLifecycle?.error ? (
                <div className="text-red-400">
                  Error: {status.userLifecycle.error}
                </div>
              ) : status?.userLifecycle ? (
                <>
                  {status.userLifecycle.created && (
                    <div className="text-green-400">
                      signed up with user [{status.userLifecycle.created}]
                    </div>
                  )}
                  {status.userLifecycle.signedIn && (
                    <div className="text-blue-400">
                      now signed in with user [{status.userLifecycle.signedIn}]
                    </div>
                  )}
                  {status.userLifecycle.deleted && (
                    <div className="text-red-400">
                      deleted user [{status.userLifecycle.deleted}]
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </div>
          {error && (
            <div className="mt-4 text-red-400" data-testid="error-message">
              <span className="text-red-400">✗</span> Error: {error}
            </div>
          )}
        </div>
      )}
    </div>
  )
} 