import { useState } from 'react'

export interface JwtResponse {
  message: string[];
  user: string;
  jwt: string;
  userLifecycle?: {
    deleted?: string;
    created?: string;
    signedIn?: string;
  };
}

export interface JwtButtonProps {
  onSuccess?: (response: JwtResponse) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function JwtButton({ onSuccess, onError, className = '' }: JwtButtonProps) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<JwtResponse | null>(null)
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
  const containerClasses = `${getContainerColor()} p-6 rounded-lg transition-colors duration-300 ${className}`

  return (
    <div className={containerClasses} data-testid="jwt-container">
      <button 
        onClick={handleClick} 
        disabled={loading} 
        data-testid="jwt-test-button"
        className={buttonClasses}
      >
        Test JWT
      </button>
      {status && (
        <div data-testid="jwt-status" className="mt-4 text-white">
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

          <div className="mb-4">
            <h4 className="font-semibold mb-2">User Lifecycle:</h4>
            <div className="flex items-center space-x-2 mb-2">
              <span className={status.user ? "text-green-400" : "text-yellow-400"}>
                {status.user ? "✓" : "⚠"}
              </span>
              <span>Status: {status.user ? "Verified" : "Not Verified"}</span>
            </div>
            {status.userLifecycle && (
              <div className="pl-6 space-y-1">
                {status.userLifecycle.deleted && (
                  <div className="text-red-400">
                    Deleted user {status.userLifecycle.deleted}
                  </div>
                )}
                {status.userLifecycle.created && (
                  <div className="text-green-400">
                    Created user {status.userLifecycle.created}
                  </div>
                )}
                {status.userLifecycle.signedIn && (
                  <div className="text-blue-400">
                    Now signed in with user {status.userLifecycle.signedIn}
                  </div>
                )}
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