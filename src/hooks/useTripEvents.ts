import { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { nanoid } from '@/lib/nanoid'
import type { TripEvent } from '@/types'

export function useTripEvents(tripId: string | undefined) {
  const [events, setEvents] = useState<TripEvent[]>([])

  useEffect(() => {
    if (!tripId) return
    const q = query(collection(db, 'trip-events'), where('tripId', '==', tripId))
    return onSnapshot(q, snap => setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() } as TripEvent))))
  }, [tripId])

  async function addEvent(data: Omit<TripEvent, 'id' | 'tripId' | 'createdAt'>) {
    const id = nanoid()
    await setDoc(doc(db, 'trip-events', id), { ...data, tripId, createdAt: Date.now() })
  }

  async function deleteEvent(id: string) {
    await deleteDoc(doc(db, 'trip-events', id))
  }

  return { events, addEvent, deleteEvent }
}
