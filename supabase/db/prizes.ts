import { createClient } from '@/config/client'
import { uploadImage, removeImage, removeImageUponEdit } from './image'
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
      `${userId}/${name}`,
      'prizes'
    )

    const newData = {
      ...data,
      image: imageUrls[0]
    }

    const { error } = await supabase.from('prizes').insert(newData)

    if (error) {
      await removeImage(
        image as File[],
        supabase,
        `${userId}/${name}`,
        'prizes'
      )
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

export const editPrize = async (
  data: PrizesForm,
  userId: string,
  prizeId: string,
  oldPath: string
): Promise<void> => {
  try {
    const { image, name } = data
    let imageUrl = null
    const supabase = createClient()

    if (Array.isArray(image)) {
      await removeImageUponEdit(supabase, oldPath, 'prizes')
      const { imageUrls } = await uploadImage(
        image as File[],
        supabase,
        `${userId}/${name}`,
        'prizes'
      )

      imageUrl = imageUrls[0]
    }

    const withoutImage = {
      ...data
    }

    const withImage = {
      ...data,
      image: imageUrl
    }

    const newData = !imageUrl ? withoutImage : withImage

    const { error } = await supabase
      .from('prizes')
      .update(newData)
      .eq('id', prizeId)

    if (error) {
      await removeImage(
        image as File[],
        supabase,
        `${userId}/${name}`,
        'prizes'
      )
      throw error.message
    }

    toast('Successfully', {
      description: 'Successfully updated prize.'
    })
  } catch (error) {
    throw error
  }
}

export const archivedPrize = async (id: string): Promise<void> => {
  try {
    const supabase = createClient()
    const today = new Date()

    const { error } = await supabase
      .from('prizes')
      .update({
        archived_at: today
      })
      .eq('id', id)

    if (error) {
      toast.error('Error!', {
        description: 'Something whent wrong.'
      })
      throw error.message
    }

    toast('Successfully', {
      description: 'Successfully removing prizes.'
    })
  } catch (error) {
    throw error
  }
}

export const claimingPrize = async (
  userId: string,
  prizeId: string,
  creditCost: number
): Promise<void> => {
  try {
    const supabase = createClient()

    const { error } = await supabase.rpc('claim_prize', {
      p_user_id: userId,
      p_prize_id: prizeId,
      p_credit_cost: creditCost
    })

    if (error) {
      throw error.message
    }

    toast('Successfully', {
      description:
        'Successfully claimed prize, wait for the information when getting your prize.'
    })
  } catch (error) {
    throw error
  }
}
