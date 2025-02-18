import { useState } from 'react'

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
    if (error || !status) return 'bg-red-900/20'
    if (!status.user || status.userLifecycle?.error) return 'bg-yellow-900/20'
    return 'bg-green-900/20'
  }

  const getButtonColor = () => {
    if (error || !status) return 'bg-red-500'
    if (!status.user || status.userLifecycle?.error) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const handleClick = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/auth/test/lifecycle', {
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
  const containerClasses = `${getContainerColor()} p-6 rounded-lg transition-colors duration-300 ${className}`

  return (
    <div className={containerClasses} data-testid="user-lifecycle-container">
      <button 
        onClick={handleClick} 
        disabled={loading} 
        data-testid="user-lifecycle-button"
        className={buttonClasses}
      >
        {!(status?.userLifecycle?.created || status?.userLifecycle?.deleted || status?.userLifecycle?.signedIn) 
          ? 'Sign Up'
          : 'Test User Lifecycle'}
      </button>
      {status && (
        <div data-testid="user-lifecycle-status" className="mt-4 text-white">
          <h3 className="text-xl font-bold mb-4">User Lifecycle Test Result:</h3>
          
          <div className="mb-4">
            <h4 className="font-semibold mb-2">User Lifecycle:</h4>
            <div className="space-y-1">
              {status.userLifecycle?.error ? (
                <div className="text-yellow-400">
                  {status.userLifecycle.error}
                </div>
              ) : status.userLifecycle?.created || status.userLifecycle?.deleted || status.userLifecycle?.signedIn ? (
                <>
                  {status.userLifecycle.deleted && (
                    <div className="text-red-400">
                      deleted user [{status.userLifecycle.deleted}]
                    </div>
                  )}
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
                </>
              ) : (
                <div className="text-gray-400">
                  No user lifecycle events yet. Click Sign Up to begin testing.
                </div>
              )}
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