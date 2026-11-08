import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface SessionState {
  session: Session | null
  isAdmin: boolean
  loading: boolean
}

/** Current auth session plus whether the user is listed in the `admins` table. */
export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>({ session: null, isAdmin: false, loading: !!supabase })

  useEffect(() => {
    if (!supabase) return
    const client = supabase
    let active = true

    async function resolve(session: Session | null) {
      if (!session) {
        if (active) setState({ session: null, isAdmin: false, loading: false })
        return
      }
      const { data } = await client.rpc('is_admin')
      if (active) setState({ session, isAdmin: data === true, loading: false })
    }

    client.auth.getSession().then(({ data }) => resolve(data.session))
    const { data: sub } = client.auth.onAuthStateChange((_event, session) => {
      void resolve(session)
    })
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  return state
}
