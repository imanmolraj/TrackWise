import React from 'react'

export default function Topbar({ auth }) {
  return (
    <header className="p-4 flex items-center justify-between">
      <div>
        <h2 className="text-xl font-semibold">Hello, {auth.user?.name}</h2>
        <p className="text-muted text-sm">{auth.user?.email}</p>
      </div>
      <button className="btn" onClick={auth.logout}>
        Logout
      </button>
    </header>
  )
}
