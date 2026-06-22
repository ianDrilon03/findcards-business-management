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
    const password = body.password as string

    if (!userId || !password) {
      return badRequestResponse({ error: 'Missing userId or password' })
    }

    const { authorized, status, message } = await authorizeAdmin()

    if (!authorized) {
      return status === 401
        ? unauthorizedResponse({ error: message })
        : forbiddenResponse({ error: message })
    }

    const supabase = await createSupabase()

    const { error } = await supabase.auth.admin.updateUserById(userId, {
      password
    })

    if (error) {
      return generalErrorResponse({ error: error.message })
    }

    return successResponse({ message: 'Password reset successfully' })
  } catch (error) {
    const newError = error as Error
    return generalErrorResponse({ error: newError.message })
  }
}
