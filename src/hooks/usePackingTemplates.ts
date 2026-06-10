import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface PackingTemplate {
  id: string
  userId: string
  name: string
  items: { title: string; category: string }[]
  createdAt: number
}

export function usePackingTemplates(userId: string | undefined) {
  const [templates, setTemplates] = useState<PackingTemplate[]>([])

  useEffect(() => {
    if (!userId) return
    const q = query(collection(db, 'packingTemplates'), where('userId', '==', userId))
    return onSnapshot(q, snap => {
      setTemplates(snap.docs.map(d => ({ id: d.id, ...d.data() } as PackingTemplate)))
    })
  }, [userId])

  async function saveTemplate(name: string, items: { title: string; category: string }[]) {
    if (!userId) return
    await addDoc(collection(db, 'packingTemplates'), { userId, name, items, createdAt: Date.now() })
  }

  async function deleteTemplate(templateId: string) {
    await deleteDoc(doc(db, 'packingTemplates', templateId))
  }

  return { templates, saveTemplate, deleteTemplate }
}
