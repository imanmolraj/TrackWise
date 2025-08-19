import React from 'react'
import {
  BarChart2,
  List,
  Wallet,
  PlusCircle,
  LayoutDashboard,
} from 'lucide-react'

export default function Sidebar({ current, onNav }) {
  const Item = ({ id, icon, label }) => (
    <button
      onClick={() => onNav(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 hover:bg-[#c5cbe0] border border-transparent hover:border-[#2c3966] text-left ${
        current === id ? 'bg-[#dbe5ff] border-[#222e4dff]' : ''
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  )

  return (
    <aside className="hidden md:block w-64 bg-card p-6 shadow-soft">
      <h1 className="text-2xl font-bold mb-6">FinWise</h1>
      <Item id="dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" />
      <Item id="transactions" icon={<List size={18} />} label="Transactions" />
      <Item id="budgets" icon={<Wallet size={18} />} label="Budgets" />
      <Item id="add" icon={<PlusCircle size={18} />} label="Add Expense" />
    </aside>
  )
}
