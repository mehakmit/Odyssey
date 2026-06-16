import { useMemo, useState, useRef, useEffect } from 'react'
import NotesTab from './NotesTab'
import PackingTab from './PackingTab'
import { useTickets } from '@/hooks/useTickets'
import { useTripEvents } from '@/hooks/useTripEvents'
import type { Trip, TicketType } from '@/types'
import { format, eachDayOfInterval, isSameDay, addDays } from 'date-fns'
import { Plane, Train, Hotel, Bus, Ticket, Car, Clock, Plus, X, Utensils, Eye, Footprints } from 'lucide-react'
import { tryParseDate } from '@/lib/parseDate'

const TYPE_ICONS: Record<TicketType, typeof Plane> = {
  flight: Plane, train: Train, hotel: Hotel, car: Car, bus: Bus, ferry: Ticket, other: Ticket,
}

type EventType = 'depart' | 'arrive' | 'checkin' | 'checkout' | 'default' | 'manual'

type DayEntry = {
  id: string
  ticket: ReturnType<typeof useTickets>['tickets'][number]
  eventType: EventType
  time: string | undefined
  manualEvent?: import('@/types').TripEvent
}

function timeToMinutes(t: string | undefined): number {
  if (!t) return 9999
  const [h, m] = t.split(':').map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

function dateMatchesDay(dateStr: string, day: Date): boolean {
  const parsed = tryParseDate(dateStr)
  return parsed !== null && isSameDay(parsed, day)
}

const EVENT_TYPES = [
  { key: 'activity', label: 'Activity', Icon: Footprints },
  { key: 'food',     label: 'Food',     Icon: Utensils },
  { key: 'sight',    label: 'Sight',    Icon: Eye },
  { key: 'other',    label: 'Other',    Icon: Ticket },
]

export default function ItineraryTab({ trip, initialView }: { trip: Trip; initialView?: string }) {
  const { tickets } = useTickets(trip.id)
  const { events: manualEvents, addEvent, deleteEvent } = useTripEvents(trip.id)
  const [activeIdx, setActiveIdx] = useState(0)
  const activePillRef = useRef<HTMLButtonElement>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [addTitle, setAddTitle] = useState('')
  const [addTime, setAddTime] = useState('')
  const [addType, setAddType] = useState('activity')
  const [view, setView] = useState<'timeline' | 'wishlist' | 'pack'>(
    initialView === 'wishlist' ? 'wishlist' : initialView === 'pack' ? 'pack' : 'timeline'
  )

  const days = useMemo(() =>
    eachDayOfInterval({ start: trip.startDate, end: trip.endDate })
  , [trip.startDate, trip.endDate])

  const ticketsByDate = useMemo(() => {
    const map: Record<string, DayEntry[]> = {}

    function addEntry(day: Date, entry: DayEntry) {
      const key = format(day, 'yyyy-MM-dd')
      if (!map[key]) map[key] = []
      if (!map[key].find(e => e.id === entry.id)) map[key].push(entry)
    }

    for (const ticket of tickets) {
      const data = { ...ticket.parsed, ...ticket.manualOverrides }
      const datesToTry: string[] = []
      if (data.date) datesToTry.push(data.date)
      if (data.allDates) datesToTry.push(...data.allDates)

      const matchingDays = days.filter(day => datesToTry.some(d => dateMatchesDay(d, day)))

      for (const day of matchingDays) {
        if (data.type === 'flight' || data.type === 'train') {
          // Departure event
          addEntry(day, {
            id: `${ticket.id}-depart`,
            ticket, eventType: 'depart',
            time: data.departureTime,
          })
          // Arrival event — next day if arrival time is before departure time (overnight)
          if (data.arrivalTime) {
            const isOvernight = timeToMinutes(data.arrivalTime) < timeToMinutes(data.departureTime)
            const arrivalDay = isOvernight ? addDays(day, 1) : day
            addEntry(arrivalDay, {
              id: `${ticket.id}-arrive`,
              ticket, eventType: 'arrive',
              time: data.arrivalTime,
            })
          }
        } else {
          addEntry(day, {
            id: `${ticket.id}-default`,
            ticket, eventType: 'default',
            time: data.departureTime,
          })
        }
      }

      // Hotel check-in day
      if (data.type === 'hotel') {
        for (const day of matchingDays) {
          addEntry(day, {
            id: `${ticket.id}-checkin`,
            ticket, eventType: 'checkin',
            time: data.checkIn?.match(/\b\d{1,2}:\d{2}\b/)?.[0],
          })
        }
        // Hotel check-out on checkout date
        if (data.checkOut) {
          const coDateStr = data.checkOut.match(/[A-Z]\w+\s+\d{1,2},?\s*\d{4}/i)?.[0]
          if (coDateStr) {
            for (const day of days) {
              if (dateMatchesDay(coDateStr, day)) {
                addEntry(day, {
                  id: `${ticket.id}-checkout`,
                  ticket, eventType: 'checkout',
                  time: data.checkOut.match(/\b\d{1,2}:\d{2}\b/)?.[0],
                })
              }
            }
          }
        }
      }
    }

    // Add manual events
    for (const ev of manualEvents) {
      addEntry(new Date(ev.date), {
        id: ev.id,
        ticket: null as any,
        eventType: 'manual' as EventType,
        time: ev.time,
        manualEvent: ev,
      })
    }

    // Sort each day's events chronologically
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time))
    }

    return map
  }, [tickets, days, manualEvents])

  useEffect(() => {
    activePillRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [activeIdx])

  const activeDay = days[activeIdx]
  const dayStr = activeDay ? format(activeDay, 'yyyy-MM-dd') : ''
  const dayEvents = ticketsByDate[dayStr] ?? []

  return (
    <div className="flex flex-col h-full">
      {/* View toggle */}
      <div className="flex gap-1 mx-4 mt-3 mb-1 p-1 rounded-2xl" style={{ background: '#0c1b30' }}>
        {(['timeline', 'wishlist', 'pack'] as const).map(v => (
          <button key={v} onClick={() => setView(v)}
            className="flex-1 py-2 rounded-xl text-sm font-semibold transition-colors"
            style={{ background: view === v ? '#e76a55' : 'transparent', color: view === v ? '#fff' : 'rgba(255,255,255,0.4)' }}>
            {v === 'timeline' ? 'Timeline' : v === 'wishlist' ? 'Wishlist' : 'Pack'}
          </button>
        ))}
      </div>

      {view === 'wishlist' && <NotesTab tripId={trip.id} />}
      {view === 'pack' && <PackingTab tripId={trip.id} />}

      {view === 'timeline' && <>
      {/* Day pills */}
      <div className="flex gap-2 px-4 py-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {days.map((day, i) => {
          const active = i === activeIdx
          const hasEvents = (ticketsByDate[format(day, 'yyyy-MM-dd')] ?? []).length > 0
          return (
            <button
              key={i}
              ref={active ? activePillRef : undefined}
              onClick={() => setActiveIdx(i)}
              className="shrink-0 flex flex-col items-center justify-between rounded-[18px] px-2 py-2.5 transition-all duration-200"
              style={{
                width: 58, height: 82,
                background: active ? '#e76a55' : '#0c1b30',
                boxShadow: active ? 'none' : '0 1px 0 rgba(255,255,255,0.06)',
                border: 'none', cursor: 'pointer',
              }}
            >
              <span className="font-mono text-[9px] uppercase tracking-wide text-white/60">{format(day, 'EEE')}</span>
              <span className="font-display italic text-3xl leading-none text-white">{format(day, 'd')}</span>
              <span className={`w-1.5 h-1.5 rounded-full transition-opacity ${hasEvents ? (active ? 'bg-white/70 opacity-100' : 'bg-indigo-400 opacity-100') : 'opacity-0'}`} />
            </button>
          )
        })}
      </div>

      {/* Day label */}
      {activeDay && (
        <div className="px-5 pb-3">
          <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">
            Day {activeIdx + 1} of {days.length}
          </p>
          <p className="font-display italic text-2xl text-white mt-0.5">
            {format(activeDay, 'EEEE, MMM d')}
          </p>
        </div>
      )}

      {/* Timeline */}
      <div className="flex-1 px-5 pb-6">
        {/* Add stop form */}
        {showAddForm && activeDay && (
          <div className="mb-4 bg-slate-900 rounded-2xl p-4 space-y-3"
            style={{ boxShadow: '0 1px 0 rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">Add stop · {format(activeDay, 'MMM d')}</p>
              <button onClick={() => setShowAddForm(false)}><X size={16} className="text-slate-500" /></button>
            </div>
            <input autoFocus placeholder="What are you doing?" value={addTitle}
              onChange={e => setAddTitle(e.target.value)}
              className="w-full bg-slate-800 text-white rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
              style={{ fontSize: 16 }} />
            <div className="flex gap-2">
              <input placeholder="Time (e.g. 14:00)" value={addTime}
                onChange={e => setAddTime(e.target.value)}
                className="flex-1 bg-slate-800 text-white rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
                style={{ fontSize: 16 }} />
              <select value={addType} onChange={e => setAddType(e.target.value)}
                className="flex-1 bg-slate-800 text-white rounded-xl px-3 py-2.5 text-sm outline-none">
                {EVENT_TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowAddForm(false)}
                className="flex-1 h-10 rounded-2xl text-slate-400 text-sm"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}>Cancel</button>
              <button
                onClick={async () => {
                  if (!addTitle.trim() || !activeDay) return
                  await addEvent({ date: format(activeDay, 'yyyy-MM-dd'), time: addTime || undefined, title: addTitle.trim(), type: addType })
                  setAddTitle(''); setAddTime(''); setAddType('activity'); setShowAddForm(false)
                }}
                className="flex-1 h-10 rounded-2xl text-white text-sm font-semibold"
                style={{ background: '#e76a55' }}>Add</button>
            </div>
          </div>
        )}

        {dayEvents.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-slate-600">
            <p className="text-sm">No events this day</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-[42px] top-2 bottom-2 w-px bg-white/[0.07]" />

            {dayEvents.map((entry) => {
              // Manual event
              if (entry.eventType === 'manual' && entry.manualEvent) {
                const ev = entry.manualEvent
                const evType = EVENT_TYPES.find(t => t.key === ev.type)
                const EvIcon = evType?.Icon ?? Ticket
                return (
                  <div key={entry.id} className="flex gap-3 py-2" style={{ position: 'relative', zIndex: 1 }}>
                    <div className="w-10 text-right pt-3 shrink-0">
                      {ev.time ? <span className="font-mono text-[11px] text-white/70">{ev.time}</span>
                        : <Clock size={11} className="text-slate-700 ml-auto mt-0.5" />}
                    </div>
                    <div className="shrink-0 flex justify-center pt-2.5" style={{ width: 28, zIndex: 1 }}>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center"
                        style={{ background: '#0c1b30', border: '1.5px solid rgba(231,106,85,0.4)' }}>
                        <EvIcon size={13} className="text-indigo-400" />
                      </div>
                    </div>
                    <div className="flex-1 bg-slate-900 rounded-2xl px-3 py-2.5 min-w-0 flex items-center gap-2"
                      style={{ boxShadow: '0 1px 0 rgba(255,255,255,0.04)' }}>
                      <p className="flex-1 text-sm font-semibold text-white">{ev.title}</p>
                      <button onClick={() => deleteEvent(ev.id)} className="text-slate-700 hover:text-red-400 shrink-0">
                        <X size={13} />
                      </button>
                    </div>
                  </div>
                )
              }

              const { ticket, eventType, time } = entry
              const data = { ...ticket.parsed, ...ticket.manualOverrides }
              const Icon = TYPE_ICONS[data.type] ?? Ticket

              let title = ''
              let subtitle = ''
              let tag = ''

              switch (eventType) {
                case 'depart':
                  title = data.type === 'train' ? 'Departs' : 'Take off'
                  subtitle = [data.flightNumber, data.origin && data.destination ? `${data.origin} → ${data.destination}` : null]
                    .filter(Boolean).join(' · ')
                  tag = data.type === 'train' ? 'Train' : 'Flight'
                  break
                case 'arrive':
                  title = data.type === 'train' ? 'Arrives' : 'Landing'
                  subtitle = data.destination ? `Arriving ${data.destination}` : ''
                  if (data.airline) subtitle = data.airline + (subtitle ? ' · ' + subtitle : '')
                  tag = data.type === 'train' ? 'Train' : 'Flight'
                  break
                case 'checkin':
                  title = 'Check in'
                  subtitle = data.hotelName ?? ''
                  tag = 'Stay'
                  break
                case 'checkout':
                  title = 'Check out'
                  subtitle = data.hotelName ?? ''
                  tag = 'Stay'
                  break
                default:
                  title = data.type.charAt(0).toUpperCase() + data.type.slice(1)
                  subtitle = data.rentalCompany ?? data.hotelName ?? ''
                  tag = data.type
              }

              return (
                <div key={entry.id} className="flex gap-3 py-2" style={{ position: 'relative', zIndex: 1 }}>
                  {/* Time */}
                  <div className="w-10 text-right pt-3 shrink-0">
                    {time
                      ? <span className="font-mono text-[11px] text-white/70 leading-none">{time}</span>
                      : <Clock size={11} className="text-slate-700 ml-auto mt-0.5" />
                    }
                  </div>

                  {/* Icon dot */}
                  <div className="shrink-0 flex justify-center pt-2.5" style={{ width: 28, zIndex: 1 }}>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ background: '#0c1b30', border: '1.5px solid rgba(255,255,255,0.14)' }}>
                      <Icon size={13} className="text-indigo-400" />
                    </div>
                  </div>

                  {/* Card */}
                  <div className="flex-1 bg-slate-900 rounded-2xl px-3 py-2.5 min-w-0"
                    style={{ boxShadow: '0 1px 0 rgba(255,255,255,0.04)' }}>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-white leading-snug">{title}</p>
                      {tag && (
                        <span className="shrink-0 text-[10px] font-mono px-2 py-0.5 rounded-full"
                          style={{ background: '#f3e9d520', color: '#f3e9d580', border: '1px solid #f3e9d515' }}>
                          {tag}
                        </span>
                      )}
                    </div>
                    {subtitle && <p className="text-xs text-slate-400 mt-0.5 leading-snug">{subtitle}</p>}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Add stop button */}
        {activeDay && (
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-4 w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold text-slate-500"
            style={{ border: '1.5px dashed rgba(255,255,255,0.08)' }}>
            <Plus size={15} /> Add stop to {format(activeDay, 'MMM d')}
          </button>
        )}
      </div>
      </>}
    </div>
  )
}
