import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { GenerateJWTButton } from './components/TestButtons/GenerateJwt/GenerateJWTButton'
import { UserLifecycleButton } from './components/TestButtons/GenerateUserLifecycle/UserLifecycleButton'
import { APIHealthButton } from './components/TestButtons/GetSupabaseHealth/GetSupaBaseHealthButton'
import { GetApiMessageButton } from './components/TestButtons/GetApiMessage/GetApiMessageButton'

function App() {
  const [count, setCount] = useState(0)
  const [jwtToken, setJwtToken] = useState(null)

  const handleJwtSuccess = (data) => {
    setJwtToken(data.token)
  }

  return (
    <>
      <div>
        Antelope
      </div>

      <div className="mx-auto my-8 w-full max-w-3xl border border-gray-700 rounded-lg overflow-hidden">
        <div className="flex border-b border-gray-700">
          <div className="w-40 flex-shrink-0 bg-gray-800 p-4 font-bold text-left border-r border-gray-700">Frontend</div>
          <div className="flex-grow p-4 text-left">
            React • TypeScript • Vite • Axios • Playwright • Vitest 
          </div>
        </div>
        <div className="flex border-b border-gray-700">
          <div className="w-40 flex-shrink-0 bg-gray-800 p-4 font-bold text-left border-r border-gray-700">API</div>
          <div className="flex-grow p-4 text-left">
            Python • Django Rest Framework • CORS Headers • Gunicorn • Whitenoise • Pytest
          </div>
        </div>
        <div className="flex border-b border-gray-700">
          <div className="w-40 flex-shrink-0 bg-gray-800 p-4 font-bold text-left border-r border-gray-700">Database</div>
          <div className="flex-grow p-4 text-left">
            Supabase • PostgreSQL
          </div>
        </div>
        <div className="flex border-b border-gray-700">
          <div className="w-40 flex-shrink-0 bg-gray-800 p-4 font-bold text-left border-r border-gray-700">Hosting</div>
          <div className="flex-grow p-4 text-left">
            Heroku • NGINX
          </div>
        </div>
        <div className="flex border-b border-gray-700">
          <div className="w-40 flex-shrink-0 bg-gray-800 p-4 font-bold text-left border-r border-gray-700">CI/CD</div>
          <div className="flex-grow p-4 text-left">
            Heroku CLI
          </div>
        </div>
        <div className="flex">
          <div className="w-40 flex-shrink-0 bg-gray-800 p-4 font-bold text-left border-r border-gray-700">Development</div>
          <div className="flex-grow p-4 text-left">
            Node.js v20 • npm • Python 3 • PowerShell
          </div>
        </div>
      </div>

      <div className="test-buttons">
        <GenerateJWTButton className="test-button" onSuccess={handleJwtSuccess} />
        <UserLifecycleButton className="test-button" token={jwtToken} />
        <APIHealthButton className="test-button" />
        <GetApiMessageButton className="test-button" />
      </div>

      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
