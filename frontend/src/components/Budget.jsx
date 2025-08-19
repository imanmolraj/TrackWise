import React, { useEffect, useState } from 'react'
import { API, authHeaders } from '../api.js'

export default function Budget({ token }) {
  const [items, setItems] = useState([])
  const [category, setCategory] = useState('Food')
  const [budget, setBudget] = useState('')

  const load = async () => {
    const res = await API('/budgets', {
      headers: { Authorization: 'Bearer ' + token },
    })
    setItems(res.items || [])
  }

  useEffect(() => {
    load()
  }, [])

  const save = async () => {
    const res = await API('/budgets', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ category, budget_amount: Number(budget) }),
    })
    if (res.ok) {
      setBudget('')
      load()
    }
  }

  return (
    <div className="card space-y-4">
      <h2 className="text-lg font-semibold">Budgets</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
          type="number"
          step="0.01"
          placeholder="Budget amount"
          value={budget}
          onChange={e => setBudget(e.target.value)}
        />

        <button className="btn" onClick={save}>
          Save Budget
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Budget</th>
            </tr>
          </thead>
          <tbody>
            {items.map(x => (
              <tr key={x.id}>
                <td>{x.category}</td>
                <td>₹ {Number(x.budget_amount).toFixed(2)}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan="2" className="text-muted">
                  No budgets set
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
