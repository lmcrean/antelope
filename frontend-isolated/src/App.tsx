import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { JwtTestButton } from './components/TestButtons/JwtButton/JwtTestButton'
import { UserLifecycleButton } from './components/TestButtons/UserLifecycle/UserLifecycleButton'
import { APIHealthButton } from './components/TestButtons/APIHealth/GetSupaBaseHealthButton'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>

      <div className="card">
        <APIHealthButton />
      </div>

      <div className="space-y-4">
        <JwtTestButton />
        <UserLifecycleButton />
      </div>
    </>
  )
}

export default App
