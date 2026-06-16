import { useState } from 'react'
import { doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { X, Copy, Check, Plus, Trash2 } from 'lucide-react'
import type { Trip, TripMember } from '@/types'

const COMMON_CURRENCIES = ['GBP', 'USD', 'EUR', 'AUD', 'CAD', 'CHF', 'SEK', 'NOK', 'DKK', 'JPY', 'SGD', 'MYR', 'HKD', 'AED', 'INR', 'THB', 'IDR', 'CNY', 'KRW', 'NZD', 'BRL', 'MXN', 'ZAR', 'TRY', 'PHP']

export default function TripSettingsModal({ trip, onClose, onDelete }: { trip: Trip; onClose: () => void; onDelete?: () => void }) {
  const [settings, setSettings] = useState(trip.settings)
  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)
  const [tripName, setTripName] = useState(trip.name)
  const [destinations, setDestinations] = useState<string[]>(trip.destinations ?? [trip.destination])
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function copyCode() {
    if (!trip.inviteToken) return
    await navigator.clipboard.writeText(trip.inviteToken)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function setStop(i: number, value: string) {
    setDestinations(d => d.map((v, idx) => idx === i ? value : v))
  }

  function addStop() {
    setDestinations(d => [...d, ''])
  }

  function removeStop(i: number) {
    setDestinations(d => d.filter((_, idx) => idx !== i))
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteDoc(doc(db, 'trips', trip.id))
      onDelete?.()
    } catch {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  async function saveSettings() {
    const filled = destinations.filter(d => d.trim())
    if (!filled.length) return
    setSaving(true)
    await updateDoc(doc(db, 'trips', trip.id), {
      settings,
      name: tripName,
      destination: filled[0],
      destinations: filled.length > 1 ? filled : null,
    })
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl w-full max-w-sm p-6 space-y-5 overflow-y-auto" style={{ maxHeight: '90dvh' }}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Trip Settings</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={18} /></button>
        </div>

        {/* Trip name */}
        <div>
          <p className="text-xs font-medium text-slate-400 mb-1">Trip name</p>
          <input value={tripName} onChange={e => setTripName(e.target.value)}
            className="w-full bg-slate-800 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500" style={{ fontSize: 16 }} />
        </div>

        {/* Destinations */}
        <div>
          <p className="text-xs font-medium text-slate-400 mb-2">Destinations</p>
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
                  value={dest}
                  onChange={e => setStop(i, e.target.value)}
                  placeholder={i === 0 ? 'First stop' : 'Next stop…'}
                  style={{ fontSize: 16 }}
                  className="flex-1 bg-slate-800 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                />
                {i > 0 && (
                  <button type="button" onClick={() => removeStop(i)} className="text-slate-600 hover:text-red-400 shrink-0">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={addStop}
            className="mt-2 flex items-center gap-1 text-xs text-indigo-400 font-medium">
            <Plus size={12} /> Add another stop
          </button>
        </div>

        {/* Trip code */}
        <div>
          <p className="text-xs font-medium text-slate-400 mb-1">Trip code</p>
          <p className="text-xs text-slate-600 mb-2">Share this code — others can enter it in the app to join.</p>
          <div className="flex items-center gap-2">
            <p className="flex-1 bg-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 font-mono tracking-widest truncate">{trip.inviteToken ?? '—'}</p>
            <button onClick={copyCode} className="bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg p-2">
              {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        {/* Members */}
        <div>
          <p className="text-xs font-medium text-slate-400 mb-2">Members ({trip.members.length})</p>
          <div className="space-y-1">
            {(Object.values(trip.memberDetails) as TripMember[]).map(member => (
              <div key={member.uid} className="flex items-center justify-between">
                <p className="text-sm text-white">{member.displayName ?? member.email}</p>
                <span className="text-xs text-slate-500 capitalize">{member.role}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Base currency */}
        <div>
          <p className="text-xs font-medium text-slate-400 mb-1">Base currency for balances</p>
          <select
            value={settings.baseCurrency}
            onChange={e => setSettings(s => ({ ...s, baseCurrency: e.target.value }))}
            style={{ fontSize: 16 }}
            className="w-full bg-slate-800 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {COMMON_CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Optional tabs */}
        <div>
          <p className="text-xs font-medium text-slate-400 mb-2">Optional tabs</p>
          <div className="space-y-2">
            {[
              { key: 'showExpenses', label: 'Expenses' },
              { key: 'showCar', label: 'Car' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-white">{label}</span>
                <div
                  onClick={() => setSettings((s: typeof settings) => ({ ...s, [key]: !s[key as keyof typeof s] }))}
                  className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${settings[key as keyof typeof settings] ? 'bg-indigo-600' : 'bg-slate-700'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings[key as keyof typeof settings] ? 'translate-x-5' : 'translate-x-1'}`} />
                </div>
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={saveSettings}
          disabled={saving}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg py-2.5 text-sm font-medium"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>

        <div className="pt-2 border-t border-white/[0.06]">
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-full py-2.5 rounded-lg text-sm text-red-400"
              style={{ background: 'rgba(239,68,68,0.08)' }}
            >
              Delete this trip
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-slate-300 text-center">Delete <strong className="text-white">{trip.name}</strong>? This can't be undone.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 py-2 rounded-lg text-sm text-slate-400"
                  style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
                  style={{ background: '#dc2626' }}
                >
                  {deleting ? 'Deleting…' : 'Delete forever'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
