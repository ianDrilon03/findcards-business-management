import {
  successResponse,
  badRequestResponse,
  unauthorizedResponse,
  forbiddenResponse,
  generalErrorResponse
} from '../helpers/response'
import { createSupabase } from '@/app/api/config/apiConfig'
import { authorizeAdmin } from '../helpers/authorizeAdmin'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const userId = body.userId as string

    if (!userId) {
      return badRequestResponse({ error: 'Missing userId' })
    }

    const {
      authorized,
      userId: callerId,
      status,
      message
    } = await authorizeAdmin()

    if (!authorized) {
      return status === 401
        ? unauthorizedResponse({ error: message })
        : forbiddenResponse({ error: message })
    }

    if (callerId === userId) {
      return badRequestResponse({ error: "You can't delete your own account" })
    }

    const supabase = await createSupabase()

    // Unlink references so the FK constraints don't block the delete.
    // Businesses and prizes are preserved; only the link to this user is removed.
    await supabase
      .from('prizes')
      .update({ claimed_by: null })
      .eq('claimed_by', userId)

    await supabase
      .from('business_personal_details')
      .update({ referred_by: null })
      .eq('referred_by', userId)

    const { error: creditsError } = await supabase
      .from('user_credits')
      .delete()
      .eq('user_id', userId)

    if (creditsError) {
      return generalErrorResponse({ error: creditsError.message })
    }

    const { error: usersError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (usersError) {
      return generalErrorResponse({ error: usersError.message })
    }

    const { error } = await supabase.auth.admin.deleteUser(userId)

    if (error) {
      return generalErrorResponse({ error: error.message })
    }

    return successResponse({ message: 'User deleted successfully' })
  } catch (error) {
    const newError = error as Error
    return generalErrorResponse({ error: newError.message })
  }
}
