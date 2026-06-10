import { useState } from 'react'
import { useTripNotes } from '@/hooks/useTripNotes'
import { Trash2, Plus, Check } from 'lucide-react'

const CATEGORIES = [
  { key: 'sight',    emoji: '🏛️', label: 'Sight' },
  { key: 'food',     emoji: '🍽️', label: 'Food' },
  { key: 'activity', emoji: '🎭', label: 'Activity' },
  { key: 'shopping', emoji: '🛍️', label: 'Shopping' },
  { key: 'other',    emoji: '📌', label: 'Other' },
]

export default function NotesTab({ tripId }: { tripId: string }) {
  const { notes, addNote, toggleNote, deleteNote } = useTripNotes(tripId)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('sight')
  const [noteText, setNoteText] = useState('')

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
    </div>
  )
}
