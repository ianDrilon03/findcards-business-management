import { createClient } from '@/config/client'
import { uploadImage, removeImage } from './image'
import { PrizesForm } from '@/lib/types/prizes'
import { toast } from 'sonner'

export const addPrize = async (
  data: PrizesForm,
  userId: string
): Promise<void> => {
  try {
    const { image, name } = data
    const supabase = createClient()

    const { imageUrls } = await uploadImage(
      image as File[],
      supabase,
      `${userId}/${name}`
    )

    const newData = {
      ...data,
      image: imageUrls[0]
    }

    const { error } = await supabase.from('prizes').insert(newData)

    if (error) {
      await removeImage(image as File[], supabase, `${userId}/${name}`)
      toast.error('Error!', {
        description: 'Something whent wrong.'
      })
      throw error.message
    }

    toast('Successfully', {
      description: 'Successfully created prize.'
    })
  } catch (error) {
    throw error
  }
}
