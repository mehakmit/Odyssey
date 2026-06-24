import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { collection, query, where, getDocs, updateDoc, doc, arrayUnion } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/hooks/useAuth'

export default function JoinPage() {
  const { token } = useParams<{ token: string }>()
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<'joining' | 'error' | 'already'>('joining')
  const [error, setError] = useState('')
  const isNative = !!(window as any).Capacitor?.isNativePlatform?.()
  const webParam = searchParams.get('web') === '1'
  const [showDownload, setShowDownload] = useState(!isNative && !webParam)

  useEffect(() => {
    if (loading || !user || !token) return

    async function join() {
      const q = query(collection(db, 'trips'), where('inviteToken', '==', token))
      const snap = await getDocs(q)

      if (snap.empty) {
        setStatus('error')
        setError('Invite link is invalid or has expired.')
        return
      }

      const tripDoc = snap.docs[0]
      const trip = tripDoc.data()

      if (trip.members.includes(user!.uid)) {
        navigate(`/trip/${tripDoc.id}`)
        return
      }

      await updateDoc(doc(db, 'trips', tripDoc.id), {
        members: arrayUnion(user!.uid),
        [`memberDetails.${user!.uid}`]: {
          uid: user!.uid,
          email: user!.email,
          displayName: user!.displayName,
          role: 'member',
          joinedAt: Date.now(),
        },
      })

      navigate(`/trip/${tripDoc.id}`)
    }

    join().catch(err => {
      setStatus('error')
      setError(err.message)
    })
  }, [loading, user, token])

  if (!loading && !user && showDownload) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-white" style={{ background: '#070e1c' }}>
        <div className="w-full max-w-sm text-center space-y-6">
          <h1 className="font-display italic text-4xl text-white">Odyssey</h1>
          <p className="text-slate-400 text-sm">You've been invited to join a trip. Download the app for the best experience.</p>
          <a
            href="https://apps.apple.com/app/odyssey/id6770611943"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-white font-semibold text-sm"
            style={{ background: '#000', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <svg width="20" height="24" viewBox="0 0 20 24" fill="white">
              <path d="M16.498 12.683c-.028-2.952 2.414-4.376 2.523-4.447-1.378-2.012-3.52-2.287-4.282-2.314-1.82-.187-3.564 1.083-4.488 1.083-.94 0-2.378-1.058-3.908-1.03-2.007.03-3.856 1.179-4.886 2.987C-.252 12.655 1.174 19.14 3.372 22.656c1.097 1.592 2.4 3.374 4.115 3.313 1.654-.066 2.277-1.066 4.278-1.066 1.994 0 2.567 1.066 4.319 1.033 1.784-.03 2.908-1.62 3.986-3.226 1.27-1.849 1.79-3.636 1.812-3.73-.04-.017-3.47-1.334-3.497-5.297zM13.45 3.906C14.33 2.834 14.936.98 14.77 0c-1.294.053-2.862.862-3.79 1.929-.831.941-1.563 2.448-1.37 3.885 1.445.111 2.921-.732 3.84-1.908z"/>
            </svg>
            Download on the App Store
          </a>
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-white/10" />
            <span className="text-slate-400 text-xs">or</span>
            <div className="flex-1 border-t border-white/10" />
          </div>
          <button
            onClick={() => setShowDownload(false)}
            className="text-sm text-indigo-400"
          >
            Continue in browser →
          </button>
        </div>
      </div>
    )
  }

  if (loading || (status === 'joining' && user)) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Joining trip...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white px-4">
      <div className="text-center">
        <p className="text-red-400 font-medium">{error}</p>
        <button onClick={() => navigate('/')} className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm">
          Go home →
        </button>
      </div>
    </div>
  )
}
