import { createClient } from '@/config/client'
import { uploadImage, removeImage } from './image'
import { BusinesInformation, BusinessDetails } from '@/service/business'
import { toast } from 'sonner'
import { fallbackDelete } from './fallbackQuery'

export type AddBusinessInfo = Pick<
  BusinessDetails,
  'businessInformation' | 'personalDetails'
>

export const addBusinessInfo = async (
  data: AddBusinessInfo,
  userId: string
): Promise<void> => {
  try {
    const { image, name } = data.businessInformation as BusinesInformation

    const supabase = createClient()

    const { imageUrls } = await uploadImage(
      image as File[],
      supabase,
      `${userId}/${name}`
    )

    const businessInfo = {
      ...data.businessInformation,
      image: imageUrls[0],
      status: 'unverified'
    }

    const { error, data: businessData } = await supabase
      .from('businesses')
      .insert(businessInfo)
      .select('id')
      .single()

    if (error) {
      await removeImage(image as File[], supabase, `${userId}/${name}`)
      toast.error('ERROR!', {
        description: 'Something went wrong'
      })
      throw error.message
    }

    const personalData = {
      ...data.personalDetails,
      referred_by: userId,
      email: data.personalDetails?.personalEmail,
      business_id: businessData?.id
    }

    const { error: detailsError } = await supabase
      .from('business_personal_details')
      .insert(personalData)

    if (detailsError) {
      await removeImage(image as File[], supabase, `${userId}/${name}`)
      await fallbackDelete(businessData.id, 'businesses', supabase)
      toast.error('ERROR!', {
        description: 'Something went wrong'
      })
      throw detailsError.message
    }

    toast('Successfully Business', {
      description: 'Please let us verifiy the business legitimacy.'
    })
  } catch (error) {
    throw error
  }
}

export const unverifiedBusiness = async (
  businessId: string,
  userId: string
): Promise<void> => {
  try {
    const supabase = createClient()

    const { error: referredError } = await supabase.rpc(
      'decrement_user_credits',
      {
        id: userId
      }
    )

    if (referredError) {
      toast.error('ERROR!', {
        description: 'Something went wrong'
      })
      throw referredError?.message
    }

    const { error } = await supabase
      .from('businesses')
      .update({
        status: 'unverified'
      })
      .eq('id', businessId)

    if (error) {
      toast.error('ERROR!', {
        description: 'Something went wrong'
      })
      throw error.message
    }

    toast('Successfully', {
      description: 'Successfully unverified business.'
    })
  } catch (error) {
    throw error
  }
}

export const verifiedBusiness = async (
  businessId: string,
  userId: string
): Promise<void> => {
  try {
    const supabase = createClient()

    const { error: referredError } = await supabase.rpc(
      'increment_user_credits',
      {
        id: userId
      }
    )

    if (referredError) {
      toast.error('ERROR!', {
        description: 'Something went wrong'
      })
      throw referredError?.message
    }

    const { error } = await supabase
      .from('businesses')
      .update({
        status: 'verified'
      })
      .eq('id', businessId)

    if (error) {
      toast.error('ERROR!', {
        description: 'Something went wrong'
      })
      throw error.message
    }

    toast('Successfully', {
      description: 'Successfully verified business.'
    })
  } catch (error) {
    throw error
  }
}

export const archiveBusiness = async (
  personalBusinessId: string
): Promise<void> => {
  try {
    const supabase = createClient()
    const today = new Date()

    const { error } = await supabase
      .from('business_personal_details')
      .update({
        archived_at: today
      })
      .eq('id', personalBusinessId)

    if (error) {
      toast.error('ERROR!', {
        description: 'Something went wrong'
      })
      throw error.message
    }

    toast('Successfully', {
      description: 'Successfully remove business'
    })
  } catch (error) {
    throw error
  }
}
