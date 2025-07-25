import { toast } from 'sonner'
import { createClient } from '@/config/client'
import { uploadImage, removeImage } from './image'
import { User } from '@/lib/types/user'
import { SettingsForm } from './auth'
import { permanentRedirect } from 'next/navigation'

export interface UserForm
  extends Pick<User, 'email' | 'password' | 'confirmPassword'> {
  avatar: File
}

export const updateUser = async (
  data: SettingsForm,
  image: File[],
  userId: string
): Promise<void> => {
  try {
    const supabase = createClient()

    const { imageUrls } = await uploadImage(
      image,
      supabase,
      `${userId}/${data.name}`,
      'avatars'
    )

    const { error } = await supabase
      .from('users')
      .update({ ...data, avatar: imageUrls[0] })
      .eq('id', userId)

    if (error) {
      await removeImage(image, supabase, `${userId}/${data.name}`, 'avatars')

      console.info(error.message)
      throw error.message
    }

    toast('Successfully', {
      description: 'Successfully updated profile'
    })
  } catch (error) {
    throw error
  }
}

export const updateRole = async (
  role: 'admin' | 'user',
  userId: string
): Promise<void> => {
  try {
    const supabase = createClient()
    const { error } = await supabase
      .from('users')
      .update({
        role
      })
      .eq('id', userId)

    if (error) {
      console.info(error.message)
      throw error.message
    }

    toast('Successfully', {
      description: 'Successfuly change role'
    })
  } catch (error) {
    throw error
  }
}

export const registerUser = async (data: UserForm): Promise<void> => {
  try {
    const { email, password } = data
    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email,
      password: password as string
    })

    if (error) {
      throw error
    }

    toast('Successfully', {
      description: 'Successfully registered users'
    })
  } catch (error) {
    throw error
  }
}

export const signOut = async (): Promise<void> => {
  const supabase = createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error.message
  }

  permanentRedirect('/auth/login')
}
