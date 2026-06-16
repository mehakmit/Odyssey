import { useState, useMemo } from 'react'
import { useTripNotes } from '@/hooks/useTripNotes'
import { Trash2, Plus, Check } from 'lucide-react'
import type { Trip } from '@/types'

const CATEGORIES = [
  { key: 'sight',    emoji: '🏛️', label: 'Sight' },
  { key: 'food',     emoji: '🍽️', label: 'Food' },
  { key: 'activity', emoji: '🎭', label: 'Activity' },
  { key: 'shopping', emoji: '🛍️', label: 'Shopping' },
  { key: 'other',    emoji: '📌', label: 'Other' },
]

type WishItem = { title: string; category: string }

function getDestWishlist(destinations: string[]): WishItem[] {
  const dest = destinations.join(' ').toLowerCase()
  const out: WishItem[] = []

  if (dest.includes('london') || dest.includes('england')) out.push(
    { title: 'Tower of London', category: 'sight' },
    { title: 'Borough Market', category: 'food' },
    { title: 'Tate Modern', category: 'sight' },
    { title: 'Notting Hill', category: 'activity' },
    { title: 'West End show', category: 'activity' },
  )
  if (dest.includes('paris') || dest.includes('france')) out.push(
    { title: 'Eiffel Tower', category: 'sight' },
    { title: 'Louvre Museum', category: 'sight' },
    { title: 'Montmartre walk', category: 'activity' },
    { title: 'Seine cruise', category: 'activity' },
    { title: 'Croissant tasting', category: 'food' },
  )
  if (dest.includes('singapore')) out.push(
    { title: 'Gardens by the Bay', category: 'sight' },
    { title: 'Marina Bay Sands', category: 'sight' },
    { title: 'Hawker centre meal', category: 'food' },
    { title: 'Sentosa Island', category: 'activity' },
    { title: 'Chinatown night market', category: 'food' },
  )
  if (dest.includes('bali')) out.push(
    { title: 'Tegalalang Rice Terraces', category: 'sight' },
    { title: 'Uluwatu Temple', category: 'sight' },
    { title: 'Cooking class', category: 'activity' },
    { title: 'Seminyak beach', category: 'activity' },
    { title: 'Ubud market', category: 'shopping' },
  )
  if (dest.includes('tokyo') || dest.includes('japan')) out.push(
    { title: 'Shibuya Crossing', category: 'sight' },
    { title: 'Senso-ji Temple', category: 'sight' },
    { title: 'Ramen dinner', category: 'food' },
    { title: 'teamLab digital art', category: 'activity' },
    { title: 'Harajuku', category: 'activity' },
  )
  if (dest.includes('rome') || (dest.includes('italy') && !dest.includes('milan'))) out.push(
    { title: 'Colosseum', category: 'sight' },
    { title: 'Vatican Museums', category: 'sight' },
    { title: 'Trevi Fountain', category: 'sight' },
    { title: 'Gelato tasting', category: 'food' },
  )
  if (dest.includes('barcelona') || dest.includes('spain')) out.push(
    { title: 'Sagrada Família', category: 'sight' },
    { title: 'Park Güell', category: 'sight' },
    { title: 'Tapas tasting', category: 'food' },
    { title: 'La Boqueria', category: 'food' },
  )
  if (dest.includes('amsterdam')) out.push(
    { title: 'Rijksmuseum', category: 'sight' },
    { title: 'Anne Frank House', category: 'sight' },
    { title: 'Canal cruise', category: 'activity' },
    { title: 'Jordaan neighbourhood', category: 'activity' },
  )
  if (dest.includes('new york') || dest.includes('nyc') || dest.includes('manhattan')) out.push(
    { title: 'Central Park', category: 'sight' },
    { title: 'The High Line', category: 'activity' },
    { title: 'Brooklyn Bridge', category: 'sight' },
    { title: 'MoMA', category: 'sight' },
  )
  if (dest.includes('dubai')) out.push(
    { title: 'Burj Khalifa', category: 'sight' },
    { title: 'Dubai Mall', category: 'shopping' },
    { title: 'Desert safari', category: 'activity' },
    { title: 'Old Dubai Creek', category: 'sight' },
  )
  if (dest.includes('bangkok') || dest.includes('thailand')) out.push(
    { title: 'Wat Pho', category: 'sight' },
    { title: 'Grand Palace', category: 'sight' },
    { title: 'Street food tour', category: 'food' },
    { title: 'Floating market', category: 'activity' },
  )
  if (dest.includes('lisbon') || dest.includes('portugal')) out.push(
    { title: 'Alfama district', category: 'sight' },
    { title: 'Pastéis de Belém', category: 'food' },
    { title: 'Sintra day trip', category: 'activity' },
    { title: 'LX Factory', category: 'shopping' },
  )
  if (dest.includes('iceland') || dest.includes('reykjavik')) out.push(
    { title: 'Northern Lights tour', category: 'activity' },
    { title: 'Blue Lagoon', category: 'activity' },
    { title: 'Golden Circle', category: 'activity' },
    { title: 'Skógafoss waterfall', category: 'sight' },
  )
  if (dest.includes('maldives')) out.push(
    { title: 'Snorkelling trip', category: 'activity' },
    { title: 'Sunrise kayaking', category: 'activity' },
    { title: 'Overwater dinner', category: 'food' },
  )
  if (dest.includes('hong kong')) out.push(
    { title: 'Victoria Peak', category: 'sight' },
    { title: 'Dim sum breakfast', category: 'food' },
    { title: 'Star Ferry', category: 'activity' },
    { title: 'Temple Street Market', category: 'shopping' },
  )
  if (dest.includes('milan') || dest.includes('italy')) out.push(
    { title: 'Duomo di Milano', category: 'sight' },
    { title: 'The Last Supper', category: 'sight' },
    { title: 'Brera district', category: 'activity' },
    { title: 'Aperitivo hour', category: 'food' },
  )

  return out
}

export default function NotesTab({ trip }: { trip: Trip }) {
  const tripId = trip.id
  const { notes, addNote, toggleNote, deleteNote } = useTripNotes(tripId)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('sight')
  const [noteText, setNoteText] = useState('')

  const destinations = trip.destinations ?? [trip.destination]
  const destWishlist = useMemo(() => getDestWishlist(destinations), [destinations.join(',')])
  const unaddedWishlist = destWishlist.filter(s =>
    !notes.some(n => n.title.toLowerCase() === s.title.toLowerCase())
  )

  const sorted = [...notes].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1
    return b.createdAt - a.createdAt
  })

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    await addNote({ title: title.trim(), category, notes: noteText.trim(), done: false })
    setTitle(''); setNoteText(''); setCategory('sight'); setShowForm(false)
  }

  return (
    <div className="pb-6">
      <div className="flex items-start justify-between px-5 pt-5 pb-4">
        <div>
          <h1 className="font-display italic text-4xl text-white leading-none">Wishlist</h1>
          <p className="text-slate-400 text-sm mt-1">Places to visit · things to do</p>
        </div>
        <button onClick={() => setShowForm(v => !v)}
          className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white mt-1 shrink-0">
          <Plus size={18} />
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="mx-4 mb-4 bg-slate-900 rounded-2xl p-4 space-y-3"
          style={{ boxShadow: '0 1px 0 rgba(255,255,255,0.06)' }}>
          <input
            autoFocus
            placeholder="What do you want to do?"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full bg-slate-800 text-white rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
            style={{ fontSize: 16 }}
          />
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(c => (
              <button key={c.key} type="button"
                onClick={() => setCategory(c.key)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                style={{ background: category === c.key ? '#e76a55' : '#152d48', color: '#fff' }}>
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
          <input
            placeholder="Notes (optional)"
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            className="w-full bg-slate-800 text-white rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
            style={{ fontSize: 16 }}
          />
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowForm(false)}
              className="flex-1 h-10 rounded-2xl text-slate-400 text-sm"
              style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
              Cancel
            </button>
            <button type="submit"
              className="flex-1 h-10 rounded-2xl text-white text-sm font-semibold"
              style={{ background: '#e76a55' }}>
              Add
            </button>
          </div>
        </form>
      )}

      {notes.length === 0 && !showForm && (
        <div className="flex flex-col items-center py-12 px-5 text-center">
          <p className="font-display italic text-2xl text-slate-600">Nothing planned yet</p>
          <p className="text-slate-600 text-sm mt-2">Add places to visit, restaurants to try, things to do.</p>
        </div>
      )}

      <div className="px-4 space-y-2">
        {sorted.map(note => {
          const cat = CATEGORIES.find(c => c.key === note.category)
          return (
            <div key={note.id}
              className="flex items-start gap-3 bg-slate-900 rounded-2xl px-4 py-3.5"
              style={{ boxShadow: '0 1px 0 rgba(255,255,255,0.04)', opacity: note.done ? 0.5 : 1 }}>
              <button
                onClick={() => toggleNote(note.id, !note.done)}
                className="w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors"
                style={{ borderColor: note.done ? '#e76a55' : 'rgba(255,255,255,0.2)', background: note.done ? '#e76a55' : 'transparent' }}>
                {note.done && <Check size={12} color="#fff" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${note.done ? 'line-through text-slate-500' : 'text-white'}`}>
                  {cat?.emoji} {note.title}
                </p>
                {note.notes && <p className="text-xs text-slate-500 mt-0.5">{note.notes}</p>}
              </div>
              <button onClick={() => deleteNote(note.id)} className="text-slate-700 hover:text-red-400 shrink-0">
                <Trash2 size={13} />
              </button>
            </div>
          )
        })}
      </div>

      {unaddedWishlist.length > 0 && (
        <div className="px-4 mt-5">
          <p className="font-mono text-[11px] text-slate-500 uppercase tracking-widest mb-2">
            Ideas for {destinations.map(d => d.split(',')[0].trim()).join(' · ')}
          </p>
          <div className="space-y-2">
            {unaddedWishlist.map(s => {
              const cat = CATEGORIES.find(c => c.key === s.category)
              return (
                <button key={s.title} type="button"
                  onClick={() => addNote({ title: s.title, category: s.category, notes: '', done: false })}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-colors"
                  style={{ background: '#0c1b30', border: '1px dashed rgba(255,255,255,0.08)' }}>
                  <span>{cat?.emoji}</span>
                  <span className="flex-1 text-sm text-white">{s.title}</span>
                  <span className="text-xs text-slate-500 shrink-0">+ Add</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
