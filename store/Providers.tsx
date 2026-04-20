'use client'

import React, { useEffect } from 'react'
import { Provider } from 'react-redux'

import { store, useAppDispatch } from '@/store'
import { setCredentials, clearCredentials } from '@/store/slices/authSlice'
import { setProfile, setCompletion } from '@/store/slices/profileSlice'

function HydrateLegacyStorage() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (typeof window === 'undefined') return

    const hydrate = () => {
      const fullName = localStorage.getItem('rankr_user_name') || ''
      const completion = localStorage.getItem('rankr_profile_completion')
      const accessToken = localStorage.getItem('rankr_token')
      const id = localStorage.getItem('rankr_user_id') || ''
      const role = (localStorage.getItem('rankr_role') || '') as any

      dispatch(setProfile({
        fullName,
        completion: completion ? Number.parseInt(completion, 10) : 0,
      }))

      if (accessToken && (id || role || fullName)) {
        dispatch(setCredentials({
          user: { id, email: '', fullName, role: role || '' },
          accessToken,
        }))
      } else {
        dispatch(clearCredentials())
      }
    }

    hydrate()

    const onCompletion = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (typeof detail?.completion === 'number') {
        dispatch(setCompletion(detail.completion))
      }
    }
    const onSessionChanged = () => hydrate()

    window.addEventListener('rankr:completion-updated', onCompletion)
    window.addEventListener('rankr:session-changed', onSessionChanged)
    return () => {
      window.removeEventListener('rankr:completion-updated', onCompletion)
      window.removeEventListener('rankr:session-changed', onSessionChanged)
    }
  }, [dispatch])

  return null
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <HydrateLegacyStorage />
      {children}
    </Provider>
  )
}
