import React, { useState } from 'react'
import AuthPage from './components/AuthPage.jsx'
import Dashboard from './components/Dashboard.jsx'
import Transactions from './components/Transactions.jsx'
import Budgets from './components/Budget.jsx'
import AddExpense from './components/AddExpense.jsx'
import Sidebar from './components/Sidebar.jsx'
import Topbar from './components/Topbar.jsx'
import { useAuth } from './api.js'

export default function App() {
  const auth = useAuth()
  const [tab, setTab] = useState('dashboard')
  const [refresh, setRefresh] = useState(0)

  if (!auth.token) return <AuthPage onAuth={auth} />

  return (
    <div className="flex h-screen">
      <Sidebar current={tab} onNav={setTab} />

      <div className="flex-1 flex flex-col">
        <Topbar auth={auth} />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {tab === 'dashboard' && (
            <Dashboard
              token={auth.token}
              onAction={() => setRefresh(x => x + 1)}
            />
          )}

          {tab === 'add' && (
            <AddExpense
              token={auth.token}
              onAdded={() => setRefresh(x => x + 1)}
            />
          )}

          {tab === 'transactions' && (
            <Transactions key={'tx-' + refresh} token={auth.token} />
          )}

          {tab === 'budgets' && (
            <Budgets key={'bd-' + refresh} token={auth.token} />
          )}
        </main>
      </div>
    </div>
  )
}
