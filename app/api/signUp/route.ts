import {
  successResponse,
  unauthorizedResponse,
  generalErrorResponse
} from '../helpers/response'
import { createSupabase } from '@/app/api/config/apiConfig'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const supabase = await createSupabase()

    const { error, data } = await supabase.auth.admin.createUser({
      email: body.email as string,
      password: body.password as string,
      email_confirm: true
    })

    if (error || !data.user) {
      return unauthorizedResponse({
        error: error?.message || 'Invalid credentials'
      })
    }

    return successResponse({
      message: 'Sign up successfully',
      userId: data.user.id
    })
  } catch (error) {
    const newError = error as Error
    return generalErrorResponse({ error: newError.message })
  }
}
