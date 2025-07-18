import { createClient } from '@/config'
import { User } from '@/lib/types/user'

export type SettingsForm = Pick<
  User,
  'name' | 'phone' | 'address' | 'gender' | 'role' | 'avatar' | 'email'
>

export const getUserDetails = async (userId: string): Promise<User> => {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('users')
      .select('id, role, avatar, email, address, gender, role, name, phone')
      .eq('id', userId)
      .single()
      .returns<User>()

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
