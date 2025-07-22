import { createClient } from '@/config'
import { User, UserCredits } from '@/lib/types/user'

export type SettingsForm = Pick<
  User,
  'name' | 'phone' | 'address' | 'gender' | 'role' | 'avatar' | 'email'
>

export const getUserDetails = async (userId: string): Promise<UserCredits> => {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('user_credits')
      .select(
        'users:user_id(id, role, avatar, email, address, gender, role, name, phone), credits'
      )
      .eq('user_id', userId)
      .single()
      .returns<UserCredits>()

    if (error) {
      throw error.message
    }

    return {
      ...data
    }
  } catch (error) {
    throw error
  }
}
