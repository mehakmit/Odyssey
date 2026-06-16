import { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { nanoid } from '@/lib/nanoid'

export interface PackingItem {
  id: string
  tripId: string
  title: string
  packed: boolean
  category: 'clothes' | 'toiletries' | 'documents' | 'electronics' | 'other'
  addedBy: string
  createdAt: number
}

export function usePackingList(tripId: string | undefined) {
  const [items, setItems] = useState<PackingItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tripId) return
    const q = query(collection(db, 'trip-packing'), where('tripId', '==', tripId))
    return onSnapshot(q, snap => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as PackingItem)))
      setLoading(false)
    })
  }, [tripId])

  async function addItem(data: { title: string; category: PackingItem['category']; addedBy: string }) {
    const id = nanoid()
    await setDoc(doc(db, 'trip-packing', id), { ...data, tripId, packed: false, createdAt: Date.now() })
  }

  async function toggleItem(id: string, packed: boolean) {
    await updateDoc(doc(db, 'trip-packing', id), { packed })
  }

  async function deleteItem(id: string) {
    await deleteDoc(doc(db, 'trip-packing', id))
  }

  const sorted = [...items].sort((a, b) => {
    if (a.packed !== b.packed) return a.packed ? 1 : -1
    return a.createdAt - b.createdAt
  })

  return { items: sorted, loading, addItem, toggleItem, deleteItem }
}
