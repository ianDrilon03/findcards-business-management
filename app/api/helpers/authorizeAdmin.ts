import { createClient } from '@/config'

interface AuthorizeAdminResult {
  authorized: boolean
  userId: string | null
  status: 401 | 403 | null
  message: string | null
}

/**
 * Verifies the calling request belongs to an authenticated admin.
 * Uses the cookie-based server client so the privileged service-role
 * routes (reset password, delete user) can't be called anonymously.
 */
export async function authorizeAdmin(): Promise<AuthorizeAdminResult> {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      authorized: false,
      userId: null,
      status: 401,
      message: 'Not authenticated'
    }
  }

  const { data } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (data?.role !== 'admin') {
    return {
      authorized: false,
      userId: user.id,
      status: 403,
      message: 'Admins only'
    }
  }

  return { authorized: true, userId: user.id, status: null, message: null }
}
