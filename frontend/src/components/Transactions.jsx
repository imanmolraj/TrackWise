import React, { useEffect, useState } from 'react'
import { API } from '../api.js'

const ICONS = {
  Food: '🍔',
  Transport: '🚖',
  Shopping: '🛍️',
  Entertainment: '🎬',
  Bills: '🧾',
  Other: '🧩',
}

export default function Transactions({ token }) {
  const [items, setItems] = useState([])

  const load = async () => {
    const res = await API('/expenses', {
      headers: { Authorization: 'Bearer ' + token },
    })
    setItems(res.items || [])
  }

  useEffect(() => {
    load()
  }, [])

  const delItem = async id => {
    const res = await API('/expenses/' + id, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + token },
    })
    if (res.ok) load()
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Transactions</h2>
        <span className="text-sm text-muted">{items.length} records</span>
      </div>

      <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
        <table className="table">
          <thead className="sticky top-0 bg-card">
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Amount</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map(x => (
              <tr key={x.id} className="hover:bg-[#0e1630]">
                <td>{x.date}</td>
                <td>
                  <span className="pill">
                    {ICONS[x.category] || '🧩'} {x.category}
                  </span>
                </td>
                <td>{x.description || '-'}</td>
                <td className="font-semibold">
                  ₹ {Number(x.amount).toFixed(2)}
                </td>
                <td>
                  <button
                    className="text-red-400 hover:text-red-500"
                    onClick={() => delItem(x.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {items.length === 0 && (
              <tr>
                <td colSpan="5" className="text-muted">
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
