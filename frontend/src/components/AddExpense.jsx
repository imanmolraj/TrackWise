import React, { useState } from 'react'
import { API, authHeaders } from '../api.js'

export default function AddExpense({ token, onAdded }) {
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [category, setCategory] = useState('Food')
  const [description, setDescription] = useState('')
  const [msg, setMsg] = useState('')

  const submit = async () => {
    const res = await API('/expenses', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({
        amount: Number(amount),
        date,
        category,
        description,
      }),
    })

    if (res.ok) {
      setAmount('')
      setDescription('')
      setMsg('✅ Expense added')
      onAdded && onAdded()
      setTimeout(() => setMsg(''), 1500)
    } else {
      setMsg('⚠️ ' + (res.error || 'Failed to save'))
    }
  }

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Add Expense</h2>
        {msg && <span className="text-sm text-green-400">{msg}</span>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          className="input"
          type="number"
          step="0.01"
          placeholder="Amount"
          value={amount}
          onChange={e => setAmount(e.target.value)}
        />
        <input
          className="input"
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
        <select
          className="input"
          value={category}
          onChange={e => setCategory(e.target.value)}
        >
          <option>Food</option>
          <option>Transport</option>
          <option>Shopping</option>
          <option>Entertainment</option>
          <option>Bills</option>
          <option>Other</option>
        </select>
        <input
          className="input"
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>

      <div>
        <button className="btn" onClick={submit}>
          Save Expense
        </button>
      </div>
    </div>
  )
}
