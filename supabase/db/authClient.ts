import { createClient } from '@/config/client'
import { permanentRedirect } from 'next/navigation'

export const signOut = async (): Promise<void> => {
  const supabase = createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error.message
  }

  permanentRedirect('/auth/login')
}
