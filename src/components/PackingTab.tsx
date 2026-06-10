import { useState } from 'react'
import { usePackingList } from '@/hooks/usePackingList'
import { useAuth } from '@/hooks/useAuth'
import { Plus, Trash2, Luggage } from 'lucide-react'
import type { PackingItem } from '@/hooks/usePackingList'

const CATEGORIES: { key: PackingItem['category']; label: string; emoji: string }[] = [
  { key: 'clothes',    label: 'Clothes',     emoji: '👕' },
  { key: 'toiletries', label: 'Toiletries',  emoji: '🧴' },
  { key: 'documents',  label: 'Documents',   emoji: '📄' },
  { key: 'electronics',label: 'Electronics', emoji: '🔌' },
  { key: 'other',      label: 'Other',       emoji: '📦' },
]

export default function PackingTab({ tripId }: { tripId: string }) {
  const { items, loading, addItem, toggleItem, deleteItem } = usePackingList(tripId)
  const { user } = useAuth()
  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState<PackingItem['category']>('clothes')

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim() || !user) return
    await addItem({ title: newTitle.trim(), category: newCategory, addedBy: user.uid })
    setNewTitle('')
    setShowAdd(false)
  }

  const packed = items.filter(i => i.packed).length
  const total = items.length

  return (
    <div className="pb-6">
      <div className="flex items-start justify-between px-5 pt-5 pb-4">
        <div>
          <h1 className="font-display italic text-4xl text-white leading-none">Packing</h1>
          <p className="text-slate-400 text-sm mt-1">
            {loading ? '…' : total === 0 ? 'Nothing added yet' : `${packed} / ${total} packed`}
          </p>
        </div>
        <button onClick={() => setShowAdd(v => !v)}
          className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white mt-1">
          <Plus size={18} />
        </button>
      </div>

      {total > 0 && (
        <div className="mx-5 mb-4 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${(packed / total) * 100}%`, background: '#e76a55' }} />
        </div>
      )}

      {showAdd && (
        <div className="mx-4 mb-4 rounded-2xl p-4 space-y-3" style={{ background: '#0c1b30', boxShadow: '0 1px 0 rgba(255,255,255,0.06)' }}>
          <form onSubmit={handleAdd} className="space-y-3">
            <input
              placeholder="Item name"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              style={{ fontSize: 16 }}
              className="w-full bg-slate-800 text-white rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
              autoFocus
            />
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(c => (
                <button key={c.key} type="button" onClick={() => setNewCategory(c.key)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                  style={{ background: newCategory === c.key ? '#6366f1' : 'rgba(255,255,255,0.08)', color: '#fff' }}>
                  {c.emoji} {c.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowAdd(false)}
                className="flex-1 h-10 rounded-xl text-slate-400 text-sm" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                Cancel
              </button>
              <button type="submit" className="flex-1 h-10 rounded-xl text-white text-sm font-semibold" style={{ background: '#e76a55' }}>
                Add
              </button>
            </div>
          </form>
        </div>
      )}

      {!loading && total === 0 && !showAdd && (
        <div className="flex flex-col items-center py-16 px-5 text-center">
          <Luggage size={36} className="text-slate-700 mb-3" />
          <p className="font-display italic text-2xl text-slate-600">Nothing packed yet</p>
          <p className="text-slate-600 text-sm mt-2">Add items to build your shared packing list.</p>
        </div>
      )}

      <div className="px-4 space-y-5">
        {CATEGORIES.filter(c => items.some(i => i.category === c.key)).map(cat => (
          <div key={cat.key}>
            <p className="font-mono text-[11px] text-slate-500 uppercase tracking-widest mb-2 px-1">
              {cat.emoji} {cat.label}
            </p>
            <div className="space-y-2">
              {items.filter(i => i.category === cat.key).map(item => (
                <div key={item.id} className="flex items-center gap-3 rounded-2xl px-4 py-3"
                  style={{ background: '#0c1b30', boxShadow: '0 1px 0 rgba(255,255,255,0.06)' }}>
                  <button
                    onClick={() => toggleItem(item.id, !item.packed)}
                    className="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                    style={{
                      borderColor: item.packed ? '#e76a55' : 'rgba(255,255,255,0.2)',
                      background: item.packed ? '#e76a55' : 'transparent',
                    }}>
                    {item.packed && <span className="text-white text-xs font-bold">✓</span>}
                  </button>
                  <span className={`flex-1 text-sm transition-colors ${item.packed ? 'line-through text-slate-500' : 'text-white'}`}>
                    {item.title}
                  </span>
                  <button onClick={() => deleteItem(item.id)} className="text-slate-700 hover:text-red-400 transition-colors p-1">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
