import { useState, useMemo } from 'react'
import { usePackingList } from '@/hooks/usePackingList'
import { useAuth } from '@/hooks/useAuth'
import { Plus, Trash2, Luggage } from 'lucide-react'
import type { PackingItem } from '@/hooks/usePackingList'
import type { Trip } from '@/types'

const CATEGORIES: { key: PackingItem['category']; emoji: string }[] = [
  { key: 'clothes',     emoji: '👕' },
  { key: 'toiletries',  emoji: '🧴' },
  { key: 'documents',   emoji: '📄' },
  { key: 'electronics', emoji: '🔌' },
  { key: 'other',       emoji: '📦' },
]

const PACKING_ITEMS = [
  'Passport', 'Travel insurance', 'Boarding pass', 'Hotel confirmation', "Driver's licence", 'Visa documents',
  'Toothbrush', 'Toothpaste', 'Deodorant', 'Shampoo', 'Conditioner', 'Face wash', 'Moisturiser',
  'Razor', 'Shaving cream', 'Sunscreen', 'After-sun', 'Lip balm', 'Hand sanitiser', 'Wet wipes',
  'Perfume', 'Nail clippers', 'Hair brush', 'Hair dryer', 'Cotton swabs',
  'T-shirts', 'Underwear', 'Socks', 'Jeans', 'Trousers', 'Dress', 'Shoes', 'Trainers', 'Jacket',
  'Jumper', 'Swimwear', 'Pyjamas', 'Belt', 'Formal outfit', 'Gym clothes', 'Sandals', 'Flip flops',
  'Scarf', 'Sunglasses', 'Cap', 'Gloves', 'Beanie', 'Thermal base layer', 'Winter coat', 'Waterproof boots',
  'Phone charger', 'Power bank', 'Laptop', 'Laptop charger', 'Headphones', 'Camera', 'Travel adapter',
  'USB cable', 'Kindle', 'Memory card',
  'Paracetamol', 'Antihistamines', 'Ibuprofen', 'Stomach tablets', 'Plasters', 'Antiseptic cream',
  'Insect repellent', 'Motion sickness tablets', 'Prescription medication',
  'Luggage lock', 'Travel pillow', 'Eye mask', 'Ear plugs', 'Water bottle', 'Snacks', 'Travel towel',
  'Umbrella', 'Packing cubes', 'Laundry bag', 'Reef-safe sunscreen', 'Snorkel and mask', 'Rashguard',
  'Beach bag', 'Thermal socks', 'Hand warmers',
]

function guessCategory(title: string): PackingItem['category'] {
  const t = title.toLowerCase()
  if (/passport|visa|insurance|licence|boarding|confirmation/.test(t)) return 'documents'
  if (/shirt|trouser|jean|dress|underwear|socks|shoes|jacket|jumper|swimwear|pyjama|scarf|gloves|beanie|coat|boots|sandal|flip|rashguard|belt|formal|gym|cap|thermal/.test(t)) return 'clothes'
  if (/toothbrush|toothpaste|deodorant|shampoo|conditioner|wash|moisturis|razor|sunscreen|lip|sanitiser|wipes|perfume|nail|hair|cotton|swabs|after-sun|repellent/.test(t)) return 'toiletries'
  if (/charger|power bank|laptop|camera|adapter|cable|kindle|memory|headphone/.test(t)) return 'electronics'
  return 'other'
}

function getDestSuggestions(destinations: string[]): string[] {
  const dest = destinations.join(' ').toLowerCase()
  const out: string[] = []
  if (/beach|bali|thailand|maldives|miami|caribbean|hawaii|malaysia|singapore|vietnam|philippines|indonesia|cancun|ibiza|goa|phuket/.test(dest))
    out.push('Swimwear', 'Reef-safe sunscreen', 'Flip flops', 'Sunglasses', 'Insect repellent', 'Beach bag', 'After-sun', 'Rashguard')
  if (/iceland|norway|sweden|finland|canada|alaska|switzerland|austria|scotland|ski|reykjavik|oslo|stockholm|toronto|montreal|lapland/.test(dest))
    out.push('Thermal base layer', 'Winter coat', 'Gloves', 'Beanie', 'Waterproof boots', 'Hand warmers', 'Thermal socks', 'Scarf')
  if (/japan|tokyo|osaka|kyoto|korea|seoul/.test(dest))
    out.push('Cash', 'Stomach tablets', 'Travel adapter', 'Comfortable trainers')
  if (/india|delhi|mumbai/.test(dest))
    out.push('Stomach tablets', 'Insect repellent', 'Hand sanitiser', 'Cash')
  return [...new Set(out)]
}

function catEmoji(cat: PackingItem['category']) {
  return CATEGORIES.find(c => c.key === cat)?.emoji ?? '📦'
}

export default function PackingTab({ trip }: { trip: Trip }) {
  const tripId = trip.id
  const { items, loading, addItem, toggleItem, deleteItem } = usePackingList(tripId)
  const { user } = useAuth()
  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState<PackingItem['category']>('clothes')

  const destinations = trip.destinations ?? [trip.destination]
  const destSuggestions = useMemo(() => getDestSuggestions(destinations), [destinations.join(',')])

  const suggestions = useMemo(() => {
    if (!newTitle.trim()) return []
    const q = newTitle.toLowerCase()
    return PACKING_ITEMS
      .filter(s => s.toLowerCase().includes(q) && s.toLowerCase() !== q)
      .slice(0, 5)
  }, [newTitle])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim() || !user) return
    await addItem({ title: newTitle.trim(), category: newCategory, addedBy: user.uid })
    setNewTitle('')
    setShowAdd(false)
  }

  async function quickAdd(title: string) {
    if (!user) return
    await addItem({ title, category: guessCategory(title), addedBy: user.uid })
  }

  const packed = items.filter(i => i.packed).length
  const total = items.length

  const sortedItems = [
    ...items.filter(i => !i.packed),
    ...items.filter(i => i.packed),
  ]

  const unaddedSuggestions = destSuggestions.filter(s =>
    !items.some(i => i.title.toLowerCase() === s.toLowerCase())
  )

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
            <div className="relative">
              <input
                placeholder="Item name"
                value={newTitle}
                onChange={e => { setNewTitle(e.target.value); setNewCategory(guessCategory(e.target.value)) }}
                style={{ fontSize: 16 }}
                className="w-full bg-slate-800 text-white rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                autoFocus
              />
              {suggestions.length > 0 && (
                <div className="mt-1 rounded-xl overflow-hidden" style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {suggestions.map(s => (
                    <button key={s} type="button"
                      onMouseDown={e => { e.preventDefault(); setNewTitle(s); setNewCategory(guessCategory(s)) }}
                      className="w-full text-left px-3 py-2.5 text-sm text-white border-b border-white/[0.06] last:border-0"
                      style={{ background: 'transparent' }}>
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {CATEGORIES.map(c => (
                <button key={c.key} type="button" onClick={() => setNewCategory(c.key)}
                  className="flex-1 h-9 rounded-xl text-lg flex items-center justify-center transition-all"
                  style={{
                    background: newCategory === c.key ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.06)',
                    border: newCategory === c.key ? '1px solid rgba(99,102,241,0.5)' : '1px solid transparent',
                  }}>
                  {c.emoji}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => { setShowAdd(false); setNewTitle('') }}
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
        <div className="flex flex-col items-center py-12 px-5 text-center">
          <Luggage size={36} className="text-slate-700 mb-3" />
          <p className="font-display italic text-2xl text-slate-600">Nothing packed yet</p>
          <p className="text-slate-600 text-sm mt-2">Add items to build your shared packing list.</p>
        </div>
      )}

      <div className="px-4 space-y-2">
        {sortedItems.map(item => (
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
            <span className="text-sm" style={{ opacity: 0.3 }}>{catEmoji(item.category)}</span>
            <button onClick={() => deleteItem(item.id)} className="text-slate-700 hover:text-red-400 transition-colors p-1">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {unaddedSuggestions.length > 0 && (
        <div className="px-4 mt-5">
          <p className="font-mono text-[11px] text-slate-500 uppercase tracking-widest mb-2">
            Suggested for {destinations.map(d => d.split(',')[0].trim()).join(' · ')}
          </p>
          <div className="flex flex-wrap gap-2">
            {unaddedSuggestions.map(s => (
              <button key={s} type="button" onClick={() => quickAdd(s)}
                className="px-3 py-1.5 rounded-full text-xs font-medium text-slate-300 transition-colors"
                style={{ background: '#0c1b30', border: '1px solid rgba(255,255,255,0.1)' }}>
                + {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
