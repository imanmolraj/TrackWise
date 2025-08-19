import React, { useEffect, useState } from 'react'
import { API } from '../api.js'
import { Pie, Line } from 'react-chartjs-2'
import 'chart.js/auto'

export default function Dashboard({ token }) {
  const [data, setData] = useState(null)
  const [recent, setRecent] = useState([])

  useEffect(() => {
    const load = async () => {
      const ov = await API('/overview', {
        headers: { Authorization: 'Bearer ' + token },
      })
      setData(ov)

      const tx = await API('/expenses', {
        headers: { Authorization: 'Bearer ' + token },
      })
      setRecent((tx.items || []).slice(0, 5))
    }
    load()
  }, [token])

  const totalThisMonth = data
    ? Object.values(data.by_category || {}).reduce((a, b) => a + b, 0)
    : 0

  const topCategory = data
    ? Object.entries(data.by_category || {}).sort((a, b) => b[1] - a[1])[0]?.[0]
    : '-'

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <h3 className="text-sm text-muted">This Month</h3>
            <span>📈</span>
          </div>
          <div className="mt-2 text-3xl font-bold">
            ₹ {totalThisMonth.toFixed(2)}
          </div>
          <p className="text-sm text-muted">Period: {data?.month || '--'}</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <h3 className="text-sm text-muted">Top Category</h3>
            <span>💳</span>
          </div>
          <div className="mt-2 text-2xl font-semibold">{topCategory}</div>
          <p className="text-sm text-muted">Highest spending area</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <h3 className="text-sm text-muted">Budgets Tracked</h3>
            <span>🐷</span>
          </div>
          <div className="mt-2 text-2xl font-semibold">
            {data?.budget_vs?.length || 0}
          </div>
          <p className="text-sm text-muted">Active categories this month</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Spending by Category</h3>
          <Pie
            data={{
              labels: Object.keys(data?.by_category || {}),
              datasets: [
                {
                  data: Object.values(data?.by_category || {}),
                  backgroundColor: [
                    '#6366F1',
                    '#10B981',
                    '#F59E0B',
                    '#EF4444',
                    '#8B5CF6',
                    '#06B6D4',
                    '#84CC16',
                  ],
                },
              ],
            }}
          />
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-2">6-Month Trend</h3>
          <Line
            data={{
              labels: (data?.trend || []).map(x => x.month),
              datasets: [
                {
                  label: 'Total',
                  data: (data?.trend || []).map(x => x.total),
                  tension: 0.3,
                  fill: false,
                },
              ],
            }}
            options={{
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true } },
            }}
          />
        </div>
      </div>

      {/* Budget vs Actual */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Budget vs Actual</h3>
        {data?.budget_vs?.length ? (
          data.budget_vs.map((x, i) => {
            const pct =
              x.budget_amount > 0
                ? Math.min(100, Math.round((100 * x.actual) / x.budget_amount))
                : 0
            return (
              <div key={i} className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-semibold">{x.category}</div>
                  <div className="text-sm text-muted">
                    ₹ {Number(x.actual).toFixed(2)} / ₹{' '}
                    {Number(x.budget_amount).toFixed(2)}
                  </div>
                </div>
                <div className="w-full h-3 bg-[#0e1630] rounded-full overflow-hidden">
                  <div
                    className={`h-3 ${x.actual > x.budget_amount ? 'bg-red-600' : 'bg-accent'}`}
                    style={{ width: pct + '%' }}
                  ></div>
                </div>
{x.actual > x.budget_amount && (
  <p className="text-red-600 text-sm mt-1">
    ⚠️ You overspent your {x.category} budget. Try to control it!
  </p>
)}

              </div>
            )
          })
        ) : (
          <p className="text-muted">No budgets set</p>
        )}
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-3">Recent Activity</h3>
        <ul className="space-y-2">
          {recent.map(r => (
            <li
              key={r.id}
              className="flex items-center justify-between border-b border-[#d6dae3ff] pb-2"
            >
              <div className="flex items-center gap-3">
                <span className="pill">{r.category}</span>
                <span className="text-muted text-sm">
                  {r.description || '-'}
                </span>
              </div>
              <div className="font-semibold">
                ₹ {Number(r.amount).toFixed(2)}{' '}
                <span className="text-muted text-sm">({r.date})</span>
              </div>
            </li>
          ))}
          {recent.length === 0 && (
            <li className="text-muted">No recent transactions</li>
          )}
        </ul>
      </div>
    </div>
  )
}
