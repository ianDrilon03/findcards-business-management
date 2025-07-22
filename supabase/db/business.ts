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
