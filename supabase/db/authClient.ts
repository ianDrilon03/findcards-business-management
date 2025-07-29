import { toast } from 'sonner'
import { createClient } from '@/config/client'
import { uploadImage, removeImage, removeImageUponEdit } from './image'
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
  userId: string,
  oldPath: string | null
): Promise<void> => {
  try {
    let imageUrl = null
    const supabase = createClient()

    if (!!oldPath) {
      console.log('trigger')
      await removeImageUponEdit(supabase, oldPath as string, 'avatars')
    }

    if (Array.isArray(image)) {
      const { imageUrls } = await uploadImage(
        image,
        supabase,
        `${userId}/${data.name}`,
        'avatars'
      )

      imageUrl = imageUrls[0]
    }

    const { error } = await supabase
      .from('users')
      .update({ ...data, avatar: imageUrl })
      .eq('id', userId)

    if (error) {
      await removeImage(image, supabase, `${userId}/${data.name}`, 'avatars')
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

export const signOut = async (): Promise<void> => {
  const supabase = createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error.message
  }

  permanentRedirect('/auth/login')
}
