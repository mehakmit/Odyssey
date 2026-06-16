import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut, deleteUser } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useTrips } from '@/hooks/useTrips'
import { useAuth } from '@/hooks/useAuth'
import { format, differenceInDays } from 'date-fns'
import { Plus, Plane, Map, BookOpen, Luggage, HelpCircle, User, X, ChevronRight } from 'lucide-react'
import CreateTripModal from '@/components/CreateTripModal'
import { OdysseyIcon } from '@/components/OdysseyIcon'
import type { Trip, TripMember } from '@/types'

const GRADIENT_FALLBACKS = [
  'linear-gradient(160deg, #0f4c81 0%, #1a6db5 100%)',
  'linear-gradient(160deg, #4a1942 0%, #7b2d8b 100%)',
  'linear-gradient(160deg, #7a2e0e 0%, #b5451b 100%)',
  'linear-gradient(160deg, #14532d 0%, #1a5c3a 100%)',
  'linear-gradient(160deg, #1e3a5c 0%, #1a3a5c 100%)',
  'linear-gradient(160deg, #3b0764 0%, #5c1a3a 100%)',
  'linear-gradient(160deg, #292524 0%, #44403c 100%)',
  'linear-gradient(160deg, #0c4a6e 0%, #1a4a5c 100%)',
]

function getDestinationGradient(destination: string): string {
  const hash = destination.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return GRADIENT_FALLBACKS[hash % GRADIENT_FALLBACKS.length]!
}

// Wikipedia article names for major destinations
const WIKI_ARTICLES: Record<string, string> = {
  'singapore': 'Marina_Bay_Sands',
  'paris': 'Eiffel_Tower',
  'london': 'Tower_Bridge',
  'new york': 'New_York_City',
  'new york city': 'Manhattan',
  'nyc': 'Manhattan',
  'tokyo': 'Tokyo',
  'kyoto': 'Fushimi_Inari-taisha',
  'osaka': 'Osaka',
  'dubai': 'Burj_Khalifa',
  'rome': 'Colosseum',
  'barcelona': 'Sagrada_Família',
  'sydney': 'Sydney_Opera_House',
  'amsterdam': 'Amsterdam',
  'prague': 'Prague',
  'venice': 'Grand_Canal,_Venice',
  'santorini': 'Santorini',
  'athens': 'Parthenon',
  'istanbul': 'Hagia_Sophia',
  'bali': 'Bali',
  'bangkok': 'Wat_Arun',
  'hong kong': 'Hong_Kong',
  'shanghai': 'The_Bund',
  'beijing': 'Great_Wall_of_China',
  'cairo': 'Egyptian_pyramids',
  'marrakech': 'Marrakesh',
  'cape town': 'Table_Mountain',
  'rio de janeiro': 'Christ_the_Redeemer',
  'rio': 'Christ_the_Redeemer',
  'mexico city': 'Mexico_City',
  'maldives': 'Maldives',
  'hawaii': 'Hawaii',
  'las vegas': 'Las_Vegas_Strip',
  'los angeles': 'Hollywood_Sign',
  'san francisco': 'Golden_Gate_Bridge',
  'chicago': 'Cloud_Gate',
  'toronto': 'Toronto',
  'montreal': 'Montreal',
  'lisbon': 'Lisbon',
  'porto': 'Porto',
  'madrid': 'Royal_Palace_of_Madrid',
  'milan': 'Milan_Cathedral',
  'florence': 'Florence',
  'amalfi': 'Amalfi_Coast',
  'mykonos': 'Mykonos',
  'berlin': 'Brandenburg_Gate',
  'vienna': 'Schönbrunn_Palace',
  'budapest': 'Hungarian_Parliament_Building',
  'stockholm': 'Stockholm',
  'copenhagen': 'Nyhavn',
  'reykjavik': 'Reykjavík',
  'iceland': 'Iceland',
  'edinburgh': 'Edinburgh_Castle',
  'dublin': 'Dublin',
  'petra': 'Petra,_Jordan',
  'jordan': 'Petra,_Jordan',
  'turkey': 'Cappadocia',
  'cappadocia': 'Cappadocia',
  'agra': 'Taj_Mahal',
  'india': 'Taj_Mahal',
  'mumbai': 'Mumbai',
  'jaipur': 'Amber_Palace',
  'vietnam': 'Hạ_Long_Bay',
  'cambodia': 'Angkor_Wat',
  'siem reap': 'Angkor_Wat',
  'new zealand': 'Milford_Sound',
  'queenstown': 'Queenstown,_New_Zealand',
  'canada': 'Canada',
}

function useWikipediaImage(destination: string) {
  const [imgUrl, setImgUrl] = useState<string | null>(null)

  useEffect(() => {
    const lower = destination.toLowerCase().trim()
    const mapped = WIKI_ARTICLES[lower]
      ?? Object.entries(WIKI_ARTICLES).find(([k]) => lower.includes(k))?.[1]
    const cityName = destination.split(',')[0].trim()
    // Try mapped article first, then city name as fallback
    const toTry = mapped && mapped !== cityName ? [mapped, cityName] : [cityName]

    let cancelled = false

    ;(async () => {
      for (const article of toTry) {
        try {
          const r = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(article)}`)
          const data = await r.json()
          if (cancelled) return
          const src = data.originalimage?.source ?? data.thumbnail?.source ?? null
          if (src) { setImgUrl(src); return }
        } catch {}
      }
    })()

    return () => { cancelled = true }
  }, [destination])

  return imgUrl
}

function wmoEmoji(code: number): string {
  if (code === 0) return '☀️'
  if (code <= 3) return '🌤️'
  if (code <= 48) return '🌫️'
  if (code <= 55) return '🌦️'
  if (code <= 67) return '🌧️'
  if (code <= 77) return '❄️'
  if (code <= 82) return '🌧️'
  if (code <= 86) return '🌨️'
  return '⛈️'
}

function useWeather(destination: string) {
  const [weather, setWeather] = useState<{ temp: number; emoji: string } | null>(null)
  useEffect(() => {
    let cancelled = false
    const city = destination.split(',')[0].trim()
    fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`)
      .then(r => r.json())
      .then(geo => {
        if (cancelled || !geo.results?.[0]) return null
        const { latitude, longitude } = geo.results[0]
        return fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`)
      })
      .then(r => r?.json())
      .then(data => {
        if (cancelled || !data?.current) return
        setWeather({ temp: Math.round(data.current.temperature_2m), emoji: wmoEmoji(data.current.weather_code) })
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [destination])
  return weather
}

function MemberAvatars({ members }: { members: Record<string, TripMember> }) {
  const entries = Object.values(members).slice(0, 3)
  const total = Object.keys(members).length
  if (entries.length === 0) return null
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        {entries.map((m, i) => {
          const initials = m.displayName
            ? m.displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
            : (m.email?.[0] ?? '?').toUpperCase()
          const colors = ['#e76a55', '#6366f1', '#0891b2', '#16a34a']
          return (
            <div key={i} className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shrink-0"
              style={{ fontSize: 11, background: colors[i % colors.length]!, border: '2px solid rgba(7,14,28,0.9)', marginLeft: i > 0 ? -10 : 0 }}>
              {initials}
            </div>
          )
        })}
      </div>
      <span className="text-[11px] text-white/60 font-mono leading-none">
        {total === 1 ? '1 person' : `${total} people`}
      </span>
    </div>
  )
}

export default function TripsPage() {
  const { user } = useAuth()
  const { trips, loading } = useTrips(user?.uid)
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [showHelp, setShowHelp] = useState(false)
  const [showAccount, setShowAccount] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const navigate = useNavigate()

  async function handleDeleteAccount() {
    if (!auth.currentUser) return
    setDeleting(true)
    setDeleteError('')
    try {
      await deleteUser(auth.currentUser)
    } catch (err: any) {
      setDeleting(false)
      if (err.code === 'auth/requires-recent-login') {
        setDeleteError('Please sign out and sign back in, then try again.')
      } else {
        setDeleteError('Something went wrong. Please try again.')
      }
    }
  }

  const now = Date.now()
  const upcoming = trips.filter(t => t.endDate >= now).sort((a, b) => a.startDate - b.startDate)
  const past = trips.filter(t => t.endDate < now).sort((a, b) => b.startDate - a.startDate)
  const hero = upcoming[0] ?? null
  const restUpcoming = upcoming.slice(1)

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="flex items-center justify-between px-5 pb-4 pt-safe">
        <div className="flex items-center gap-2.5">
          <OdysseyIcon size={28} variant="mark" />
          <h1 className="font-display italic text-3xl text-white">Odyssey</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowJoin(true)} className="text-sm text-slate-400 font-medium px-2 py-2">
            Join
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-2 rounded-full text-sm font-semibold"
          >
            <Plus size={15} /> New trip
          </button>
          <button onClick={() => setShowHelp(true)} className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
            <HelpCircle size={16} />
          </button>
          <button onClick={() => setShowAccount(true)} className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
            <User size={16} />
          </button>
        </div>
      </header>

      <main className="pb-10">
        {loading && <p className="text-slate-500 text-sm px-5 py-8">Loading…</p>}

        {/* Hero trip card */}
        {hero && (
          <div className="px-4 mb-4">
            <HeroCard trip={hero} onClick={() => navigate(`/trip/${hero.id}`)} />
          </div>
        )}

        {/* Quick actions for hero trip */}
        {hero && (
          <div className="px-4 mb-3 grid grid-cols-4 gap-2">
            {[
              { icon: Plane,    label: 'Tickets',  state: { tab: 'tickets' } },
              { icon: Map,      label: 'Plan',     state: { tab: 'itinerary' } },
              { icon: BookOpen, label: 'Wishlist', state: { tab: 'itinerary', view: 'wishlist' } },
              { icon: Luggage,  label: 'Pack',     state: { tab: 'itinerary', view: 'pack' } },
            ].map(({ icon: Icon, label, state: navState }) => (
              <button
                key={label}
                onClick={() => navigate(`/trip/${hero.id}`, { state: navState })}
                className="flex flex-col items-center gap-1.5 rounded-2xl py-3 transition-colors"
                style={{ background: '#0c1b30', boxShadow: '0 1px 0 rgba(255,255,255,0.06)' }}
              >
                <Icon size={18} className="text-indigo-400" />
                <span className="text-[11px] font-mono text-slate-300 uppercase tracking-wide">{label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Trip stats */}
        {hero && (
          <div className="px-4 mb-5 grid grid-cols-3 gap-2">
            {[
              { label: 'Duration', value: `${Math.max(1, differenceInDays(hero.endDate, hero.startDate))} days` },
              { label: 'Travellers', value: `${hero.members.length} ${hero.members.length === 1 ? 'person' : 'people'}` },
              { label: 'Currency', value: hero.settings.baseCurrency ?? 'GBP' },
            ].map(s => (
              <div key={s.label} className="rounded-2xl px-3 py-2.5 text-center" style={{ background: '#0c1b30', boxShadow: '0 1px 0 rgba(255,255,255,0.06)' }}>
                <p className="font-mono text-[11px] text-slate-400 uppercase tracking-wider">{s.label}</p>
                <p className="text-white text-base font-semibold mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Route cards — shown when trip has multiple destinations */}
        {hero && (hero.destinations ?? []).length > 1 && (
          <div className="mb-5">
            <p className="font-mono text-[12px] text-slate-400 uppercase tracking-wider mb-2 px-5">Your route</p>
            <div className="flex gap-3 px-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {(hero.destinations!).map((dest, i) => (
                <DestinationStopCard key={i} name={dest} index={i} total={hero.destinations!.length} />
              ))}
            </div>
          </div>
        )}

        {/* Rest of upcoming */}
        {restUpcoming.length > 0 && (
          <section className="px-5 mb-6">
            <p className="text-[12px] font-mono text-slate-400 uppercase tracking-wider mb-3">Upcoming</p>
            <div className="space-y-2.5">
              {restUpcoming.map(t => (
                <SmallTripCard key={t.id} trip={t} onClick={() => navigate(`/trip/${t.id}`)} />
              ))}
            </div>
          </section>
        )}

        {/* Past trips */}
        {past.length > 0 && (
          <section className="mb-6">
            <p className="text-[12px] font-mono text-slate-400 uppercase tracking-wider mb-3 px-5">Past adventures</p>
            <div className="flex gap-3 px-4 overflow-x-auto scrollbar-none pb-1">
              {past.map(t => (
                <PastTripCard key={t.id} trip={t} onClick={() => navigate(`/trip/${t.id}`)} />
              ))}
            </div>
          </section>
        )}

        {!loading && trips.length === 0 && (
          <div className="px-4 py-4 space-y-5">
            <EmptyHero onCreateTrip={() => setShowCreate(true)} />
            <div className="grid grid-cols-2 gap-3">
              {[
                { emoji: '✈️', title: 'Flights & trains', desc: 'Upload boarding passes — we parse them automatically' },
                { emoji: '🏨', title: 'Hotel bookings', desc: 'Keep all your stay info in one place' },
                { emoji: '📅', title: 'Day-by-day plan', desc: 'Visual timeline for every day of your trip' },
                { emoji: '👥', title: 'Travel together', desc: 'Invite friends and plan as a group' },
              ].map(f => (
                <div key={f.title} className="rounded-2xl px-4 py-4 flex flex-col gap-2"
                  style={{ background: '#0c1b30', boxShadow: '0 1px 0 rgba(255,255,255,0.05)' }}>
                  <span className="text-2xl">{f.emoji}</span>
                  <p className="text-white text-sm font-semibold leading-tight">{f.title}</p>
                  <p className="text-slate-500 text-xs leading-snug">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {showCreate && <CreateTripModal onClose={() => setShowCreate(false)} />}

      {/* Help modal */}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

      {/* Account sheet */}
      {showAccount && (
        <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl w-full max-w-sm p-6 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-semibold text-white">Account</h2>
              <button onClick={() => { setShowAccount(false); setShowDeleteConfirm(false); setDeleteError('') }} className="text-slate-400">
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-slate-500 pb-1">{user?.email}</p>

            {!showDeleteConfirm ? (
              <>
                <button
                  onClick={() => { signOut(auth); setShowAccount(false) }}
                  className="w-full text-left px-4 py-3 rounded-xl text-sm text-white flex items-center justify-between"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  Sign out
                  <ChevronRight size={16} className="text-slate-500" />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full px-4 py-3 rounded-xl text-sm text-red-400 text-left"
                  style={{ background: 'rgba(239,68,68,0.08)' }}
                >
                  Delete account
                </button>
              </>
            ) : (
              <div className="space-y-3">
                <div className="rounded-xl p-4" style={{ background: 'rgba(239,68,68,0.08)' }}>
                  <p className="text-sm text-white font-semibold mb-1">Delete your account?</p>
                  <p className="text-xs text-slate-400 leading-relaxed">This permanently deletes your account and cannot be reversed. Trips you've shared will remain visible to other members.</p>
                </div>
                {deleteError && <p className="text-xs text-red-400">{deleteError}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={() => { setShowDeleteConfirm(false); setDeleteError('') }}
                    className="flex-1 py-2.5 rounded-lg text-sm text-slate-400"
                    style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
                    style={{ background: '#dc2626' }}
                  >
                    {deleting ? 'Deleting…' : 'Delete forever'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showJoin && (
        <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl w-full max-w-sm p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Join a trip</h2>
            <p className="text-sm text-slate-400">Enter the trip code shared by the organiser.</p>
            <input
              value={joinCode}
              onChange={e => setJoinCode(e.target.value)}
              placeholder="Paste trip code…"
              className="w-full bg-slate-800 text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              style={{ fontSize: 16 }}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => { setShowJoin(false); setJoinCode('') }}
                className="flex-1 py-2.5 rounded-lg text-sm text-slate-400"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}
              >
                Cancel
              </button>
              <button
                onClick={() => { if (joinCode.trim()) navigate(`/join/${joinCode.trim()}`) }}
                disabled={!joinCode.trim()}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 disabled:opacity-50"
              >
                Join
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function EmptyHero({ onCreateTrip }: { onCreateTrip: () => void }) {
  const imgUrl = useWikipediaImage('Eiffel Tower')
  return (
    <div className="rounded-[28px] overflow-hidden relative text-white px-6 pt-44 pb-8"
      style={{ background: '#0c1b30', boxShadow: '0 24px 60px -28px rgba(0,0,0,0.7)' }}>
      {imgUrl && (
        <img src={imgUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
      )}
      <div className="absolute inset-0"
        style={{ background: 'linear-gradient(to bottom, rgba(7,14,28,0.1) 0%, rgba(7,14,28,0.85) 60%, #070e1c 100%)' }} />
      <div className="relative text-center">
        <p className="font-display italic text-5xl leading-tight text-white mb-3">Your next<br />adventure<br />awaits</p>
        <p className="text-white/60 text-sm mb-6">Plan trips, split costs, and keep everyone on the same page.</p>
        <button onClick={onCreateTrip} className="px-6 py-3 rounded-full text-sm font-semibold text-white" style={{ background: '#e76a55' }}>
          Plan your first trip
        </button>
      </div>
    </div>
  )
}

function DestinationStopCard({ name, index, total }: { name: string; index: number; total: number }) {
  const imgUrl = useWikipediaImage(name)
  const short = name.split(',')[0].trim()
  return (
    <div className="shrink-0 flex items-center gap-2">
      <div className="w-28 rounded-2xl overflow-hidden relative text-left" style={{ background: '#0c1b30' }}>
        <div className="h-20 relative" style={{ background: 'linear-gradient(160deg, #1e3a5c 0%, #152d48 100%)' }}>
          {imgUrl && <img src={imgUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 30%, rgba(7,14,28,0.7) 100%)' }} />
          <div className="absolute bottom-1.5 left-2.5">
            <span className="font-mono text-[8px] text-white/40 uppercase tracking-wider">Stop {index + 1}</span>
          </div>
        </div>
        <div className="px-2.5 py-2">
          <p className="text-white text-xs font-semibold leading-tight truncate">{short}</p>
        </div>
      </div>
      {index < total - 1 && (
        <span className="text-slate-600 text-sm font-mono shrink-0">→</span>
      )}
    </div>
  )
}

function HeroCard({ trip, onClick }: { trip: Trip; onClick: () => void }) {
  const daysUntil = differenceInDays(trip.startDate, Date.now())
  const isUpcoming = trip.startDate > Date.now()
  const isActive = trip.startDate <= Date.now() && trip.endDate >= Date.now()
  const destinations = trip.destinations ?? [trip.destination]
  const imgUrl = useWikipediaImage(destinations[0])
  const weather = useWeather(destinations[0])
  const routeLabel = destinations.length > 1
    ? destinations.map(d => d.split(',')[0].trim()).join(' → ')
    : trip.destination

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-[28px] overflow-hidden relative text-white"
      style={{ boxShadow: '0 24px 60px -28px rgba(0,0,0,0.7)', minHeight: 280 }}
    >
      <div className="absolute inset-0" style={{ background: getDestinationGradient(trip.destination) }} />
      {imgUrl && (
        <img src={imgUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
      )}
      <div className="absolute inset-0"
        style={{ background: 'linear-gradient(to bottom, rgba(7,14,28,0.05) 0%, rgba(7,14,28,0.7) 55%, #070e1c 100%)' }} />

      {weather && (
        <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-semibold"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)' }}>
          <span>{weather.emoji}</span>
          <span className="text-white">{weather.temp}°</span>
        </div>
      )}

      <div className="relative p-6 pt-32 flex flex-col gap-3">
        {/* Status + members row */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full"
            style={{ background: '#f3e9d5', color: '#0A1A2E' }}>
            {isActive ? '● Now travelling' : isUpcoming ? '● Upcoming' : 'Recent'}
          </span>
          <MemberAvatars members={trip.memberDetails ?? {}} />
        </div>

        <div>
          <h2 className="font-display italic leading-[0.95] tracking-tight"
            style={{ fontSize: 48, letterSpacing: -1 }}>
            {trip.name}
          </h2>
          <p className="text-white/55 font-display italic leading-tight" style={{ fontSize: destinations.length > 1 ? 20 : 28 }}>
            {routeLabel}
          </p>
        </div>

        <div className="flex items-end justify-between">
          <p className="font-mono text-[13px] text-white/75 uppercase tracking-wide">
            {format(trip.startDate, 'MMM d')} — {format(trip.endDate, 'MMM d, yyyy')}
          </p>
          {isUpcoming && daysUntil >= 0 && (
            <div className="flex items-baseline gap-1">
              <span className="font-display italic text-4xl leading-none text-white">{daysUntil}</span>
              <span className="font-mono text-[11px] text-white/70 uppercase tracking-wide">days</span>
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

function SmallTripCard({ trip, onClick }: { trip: Trip; onClick: () => void }) {
  const imgUrl = useWikipediaImage(trip.destination)
  return (
    <button onClick={onClick} className="w-full text-left rounded-2xl overflow-hidden flex items-center gap-0"
      style={{ background: '#0c1b30', boxShadow: '0 1px 0 rgba(255,255,255,0.06)' }}>
      <div className="w-16 h-16 shrink-0 relative" style={{ background: getDestinationGradient(trip.destination) }}>
        {imgUrl && <img src={imgUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />}
      </div>
      <div className="flex-1 min-w-0 px-4 py-3">
        <p className="font-semibold text-white truncate">{trip.name}</p>
        <p className="text-slate-400 text-xs mt-0.5">{trip.destination} · {format(trip.startDate, 'MMM d')} – {format(trip.endDate, 'MMM d')}</p>
      </div>
      <span className="text-slate-600 text-sm font-mono pr-4">›</span>
    </button>
  )
}

function HelpModal({ onClose }: { onClose: () => void }) {
  const sections = [
    { emoji: '✈️', title: 'Your trips', desc: "The home screen shows your next upcoming trip. Tap it to open it. Use New trip to create one, or Join to enter a code from a friend." },
    { emoji: '🎫', title: 'Tickets', desc: "Inside a trip, go to the Tickets tab and tap + to upload a boarding pass, hotel voucher, or car rental. Upload a PDF for best results — screenshots also work. Tap the pencil icon on any ticket to edit fields manually." },
    { emoji: '📅', title: 'Day planner', desc: "The Plan tab shows a day-by-day timeline. Tap any day to add activities and notes. Switch to Wishlist to keep track of places you want to visit." },
    { emoji: '💸', title: 'Expenses', desc: "Enable the Expenses tab in trip settings (gear icon). Log costs, assign who paid, and see a running balance of who owes what." },
    { emoji: '🧳', title: 'Packing list', desc: "Tap the Pack shortcut on the home screen or go to Plan → Pack inside a trip. Check off items as you pack." },
    { emoji: '👥', title: 'Inviting others', desc: "Open your trip → tap the gear icon → copy the trip code. Others tap Join on the home screen and paste it to join your trip." },
  ]

  const faqs = [
    { q: "My ticket didn't parse correctly", a: "Tap the ticket to open it, then tap the pencil icon in the top right to edit any field manually. Changes are saved instantly." },
    { q: "Only one of my flights was detected", a: "Try uploading the PDF version of your itinerary instead — PDF parsing is more reliable than image OCR. If you only have a screenshot, use the pencil icon to add the missing flight manually." },
    { q: "The app isn't loading", a: "Odyssey works offline but needs an internet connection on first launch to sign in. Try force-quitting and reopening the app." },
    { q: "How do I delete my account?", a: "Tap the person icon in the top-right of the home screen, then choose Delete account. This action cannot be reversed." },
  ]

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 overflow-y-auto">
      <div className="px-5 pt-safe pb-12 max-w-lg mx-auto">
        <div className="flex items-center justify-between py-4 sticky top-0 bg-slate-950 z-10">
          <h1 className="text-xl font-semibold text-white">Help & Support</h1>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
            <X size={18} />
          </button>
        </div>

        <p className="font-mono text-[11px] text-slate-500 uppercase tracking-widest mb-4">Getting around</p>
        <div className="space-y-3 mb-8">
          {sections.map(item => (
            <div key={item.title} className="flex gap-4 rounded-2xl px-4 py-4" style={{ background: '#0c1b30' }}>
              <span className="text-2xl shrink-0">{item.emoji}</span>
              <div>
                <p className="text-white text-sm font-semibold mb-0.5">{item.title}</p>
                <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="font-mono text-[11px] text-slate-500 uppercase tracking-widest mb-4">Common questions</p>
        <div className="space-y-3 mb-8">
          {faqs.map(item => (
            <div key={item.q} className="rounded-2xl px-4 py-4" style={{ background: '#0c1b30' }}>
              <p className="text-white text-sm font-semibold mb-1">{item.q}</p>
              <p className="text-slate-400 text-xs leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl px-5 py-6 text-center" style={{ background: '#0c1b30' }}>
          <p className="text-white text-sm font-semibold mb-1">Still need help?</p>
          <p className="text-slate-400 text-xs mb-4">Send us a message and we'll get back to you.</p>
          <a
            href="https://myodyssey.live/support"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-indigo-600 text-white text-sm font-semibold px-6 py-2.5 rounded-full"
          >
            Contact support
          </a>
        </div>
      </div>
    </div>
  )
}

function PastTripCard({ trip, onClick }: { trip: Trip; onClick: () => void }) {
  const imgUrl = useWikipediaImage(trip.destination)
  return (
    <button onClick={onClick} className="shrink-0 w-36 rounded-[20px] overflow-hidden bg-slate-900 text-left">
      <div className="h-24 relative" style={{ background: getDestinationGradient(trip.destination) }}>
        {imgUrl && <img src={imgUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />}
      </div>
      <div className="px-3 py-2.5">
        <p className="font-display italic text-lg leading-tight text-white">{trip.name}</p>
        <p className="font-mono text-[10px] text-slate-500 uppercase tracking-wide mt-1">
          {format(trip.startDate, 'MMM yyyy')}
        </p>
      </div>
    </button>
  )
}
