import React, { useState } from 'react'

export default function AuthPage({ onAuth }) {
  const [tab, setTab] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg text-ink p-6">
      <div className="card max-w-md w-full space-y-4">
        <h1 className="text-3xl font-bold">Welcome to FinWise</h1>
        <p className="text-muted">Register or Login to continue</p>

        <div className="flex gap-3">
          <button
            className={`btn ${tab === 'login' ? 'opacity-100' : 'opacity-60'}`}
            onClick={() => setTab('login')}
          >
            Login
          </button>
          <button
            className={`btn ${tab === 'register' ? 'opacity-100' : 'opacity-60'}`}
            onClick={() => setTab('register')}
          >
            Register
          </button>
        </div>

        {tab === 'register' && (
          <div className="space-y-3">
            <input
              className="input"
              placeholder="Full name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <input
              className="input"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <input
              className="input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button
              className="btn w-full"
              onClick={async () => {
                setError('')
                try {
                  await onAuth.register(name, email, password)
                } catch (e) {
                  setError(e.message)
                }
              }}
            >
              Create Account
            </button>
            {error && <p className="text-red-400 text-sm">⚠️ {error}</p>}
          </div>
        )}

        {tab === 'login' && (
          <div className="space-y-3">
            <input
              className="input"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <input
              className="input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button
              className="btn w-full"
              onClick={async () => {
                setError('')
                try {
                  await onAuth.login(email, password)
                } catch (e) {
                  setError(e.message)
                }
              }}
            >
              Login
            </button>
            {error && <p className="text-red-400 text-sm">⚠️ {error}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
