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

      <div className="tech-stack-table">
        <div className="tech-stack-table-row">
          <div className="tech-stack-table-cell tech-stack-header">Frontend</div>
          <div className="tech-stack-table-cell">
            React • TypeScript • Vite • Axios • Playwright • Vitest 
          </div>
        </div>
        <div className="tech-stack-table-row">
          <div className="tech-stack-table-cell tech-stack-header">API</div>
          <div className="tech-stack-table-cell">
            Python • Django Rest Framework • CORS Headers • Gunicorn • Whitenoise • Pytest
          </div>
        </div>
        <div className="tech-stack-table-row">
          <div className="tech-stack-table-cell tech-stack-header">Database</div>
          <div className="tech-stack-table-cell">
            Supabase • PostgreSQL
          </div>
        </div>
        <div className="tech-stack-table-row">
          <div className="tech-stack-table-cell tech-stack-header">Hosting</div>
          <div className="tech-stack-table-cell">
            Heroku • NGINX
          </div>
        </div>
        <div className="tech-stack-table-row">
          <div className="tech-stack-table-cell tech-stack-header">CI/CD</div>
          <div className="tech-stack-table-cell">
            Heroku CLI
          </div>
        </div>
        <div className="tech-stack-table-row">
          <div className="tech-stack-table-cell tech-stack-header">Development</div>
          <div className="tech-stack-table-cell">
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
