import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useTrips } from '@/hooks/useTrips'
import { useNavigate } from 'react-router-dom'
import { X, Plus, Trash2 } from 'lucide-react'

function detectCurrency(destination: string): string {
  const lower = destination.toLowerCase()
  const map: [string, string][] = [
    ['singapore', 'SGD'], ['malaysia', 'MYR'], ['uk', 'GBP'], ['england', 'GBP'],
    ['london', 'GBP'], ['scotland', 'GBP'], ['ireland', 'EUR'], ['france', 'EUR'],
    ['paris', 'EUR'], ['germany', 'EUR'], ['spain', 'EUR'], ['italy', 'EUR'],
    ['netherlands', 'EUR'], ['amsterdam', 'EUR'], ['greece', 'EUR'], ['portugal', 'EUR'],
    ['lisbon', 'EUR'], ['japan', 'JPY'], ['tokyo', 'JPY'], ['kyoto', 'JPY'],
    ['canada', 'CAD'], ['toronto', 'CAD'], ['montreal', 'CAD'], ['vancouver', 'CAD'],
    ['australia', 'AUD'], ['sydney', 'AUD'], ['melbourne', 'AUD'], ['usa', 'USD'],
    ['united states', 'USD'], ['new york', 'USD'], ['los angeles', 'USD'],
    ['switzerland', 'CHF'], ['zurich', 'CHF'], ['sweden', 'SEK'], ['stockholm', 'SEK'],
    ['norway', 'NOK'], ['oslo', 'NOK'], ['denmark', 'DKK'], ['copenhagen', 'DKK'],
    ['thailand', 'THB'], ['bangkok', 'THB'], ['india', 'INR'], ['mumbai', 'INR'],
    ['dubai', 'AED'], ['uae', 'AED'], ['china', 'CNY'], ['beijing', 'CNY'],
    ['hong kong', 'HKD'], ['south korea', 'KRW'], ['seoul', 'KRW'],
    ['new zealand', 'NZD'], ['auckland', 'NZD'], ['brazil', 'BRL'],
    ['mexico', 'MXN'], ['turkey', 'TRY'], ['istanbul', 'TRY'],
    ['south africa', 'ZAR'], ['cape town', 'ZAR'], ['indonesia', 'IDR'],
    ['bali', 'IDR'], ['vietnam', 'VND'], ['cambodia', 'USD'], ['philippines', 'PHP'],
  ]
  for (const [key, currency] of map) {
    if (lower.includes(key)) return currency
  }
  return 'GBP'
}

export default function CreateTripModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth()
  const { createTrip } = useTrips(user?.uid)
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [destinations, setDestinations] = useState([''])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)

  function addStop() {
    setDestinations(d => [...d, ''])
  }

  function removeStop(i: number) {
    setDestinations(d => d.filter((_, idx) => idx !== i))
  }

  function setStop(i: number, value: string) {
    setDestinations(d => d.map((v, idx) => idx === i ? value : v))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    const filled = destinations.filter(d => d.trim())
    if (!filled.length) return
    setLoading(true)
    try {
      const id = await createTrip({
        name,
        destination: filled[0],
        destinations: filled.length > 1 ? filled : undefined,
        startDate: new Date(startDate).getTime(),
        endDate: new Date(endDate).getTime(),
        user: { uid: user.uid, email: user.email!, displayName: user.displayName },
        baseCurrency: detectCurrency(filled[0]),
      })
      navigate(`/trip/${id}`)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">New Trip</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Trip name</label>
            <input
              type="text"
              placeholder="e.g. Summer 2025"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              style={{ fontSize: 16 }}
              className="w-full bg-slate-800 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Destinations</label>
            <div className="space-y-2">
              {destinations.map((dest, i) => (
                <div key={i} className="flex items-center gap-2">
                  {destinations.length > 1 && (
                    <div className="flex flex-col items-center shrink-0">
                      <div className="w-2 h-2 rounded-full bg-indigo-500" />
                      {i < destinations.length - 1 && <div className="w-px h-6 bg-slate-700 mt-1" />}
                    </div>
                  )}
                  <input
                    type="text"
                    placeholder={i === 0 ? 'e.g. Tokyo, Japan' : 'Next stop…'}
                    required
                    value={dest}
                    onChange={e => setStop(i, e.target.value)}
                    style={{ fontSize: 16 }}
                    className="flex-1 bg-slate-800 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {i > 0 && (
                    <button type="button" onClick={() => removeStop(i)} className="text-slate-400 hover:text-red-400 shrink-0">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addStop}
              className="mt-2 flex items-center gap-1 text-xs text-indigo-400 font-medium"
            >
              <Plus size={12} /> Add another stop
            </button>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Start date</label>
            <input
              type="date"
              required
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              style={{ fontSize: 16 }}
              className="w-full bg-slate-800 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">End date</label>
            <input
              type="date"
              required
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              style={{ fontSize: 16 }}
              className="w-full bg-slate-800 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg py-2.5 text-sm font-medium mt-2 transition-colors"
          >
            {loading ? 'Creating...' : 'Create Trip'}
          </button>
        </form>
      </div>
    </div>
  )
}
