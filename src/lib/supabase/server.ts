import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// This is the modern, recommended implementation for server-side client creation.
// It uses `getAll` and `setAll` cookie methods to be compatible with future Supabase versions.
export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: async () => {
          const store = await cookieStore
          return store.getAll()
        },
        setAll: async (cookiesToSet) => {
          try {
            const store = await cookieStore
            cookiesToSet.forEach((cookie) => store.set(cookie))
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
} 