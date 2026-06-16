import { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { nanoid } from '@/lib/nanoid'
import type { TripNote } from '@/types'

export function useTripNotes(tripId: string | undefined) {
  const [notes, setNotes] = useState<TripNote[]>([])

  useEffect(() => {
    if (!tripId) return
    const q = query(collection(db, 'trip-notes'), where('tripId', '==', tripId))
    return onSnapshot(q, snap => setNotes(snap.docs.map(d => ({ id: d.id, ...d.data() } as TripNote))))
  }, [tripId])

  async function addNote(data: Omit<TripNote, 'id' | 'tripId' | 'createdAt'>) {
    const id = nanoid()
    await setDoc(doc(db, 'trip-notes', id), { ...data, tripId, createdAt: Date.now() })
  }

  async function toggleNote(id: string, done: boolean) {
    await updateDoc(doc(db, 'trip-notes', id), { done })
  }

  async function deleteNote(id: string) {
    await deleteDoc(doc(db, 'trip-notes', id))
  }

  return { notes, addNote, toggleNote, deleteNote }
}
