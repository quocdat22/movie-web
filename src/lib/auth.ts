import { createClient } from '@/lib/supabase/client'

export type UserRole = 'user' | 'admin'

export interface UserProfile {
  id: string
  full_name?: string
  avatar_url?: string
  role: UserRole
  updated_at?: string
}

// Client-side function to check admin status
export async function isUserAdminClient(): Promise<boolean> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return false

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    return profile?.role === 'admin'
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

// Get user profile with role (client-side)
export async function getUserProfileClient(): Promise<UserProfile | null> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return null

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    return profile
  } catch (error) {
    console.error('Error getting user profile:', error)
    return null
  }
}
