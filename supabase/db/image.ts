import { SupabaseClient } from '@supabase/supabase-js'
import { toast } from 'sonner'

export const uploadImage = async (
  images: File[],
  supabase: SupabaseClient,
  projectId: string,
  bucket = 'business'
): Promise<{ imageUrls: string[] }> => {
  const imageUrls: string[] = []

  if (images && images.length > 0) {
    for (const image of images) {
      const fileName = image?.name as string
      const storageName = `${projectId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(storageName, image, {
          contentType: 'image/png'
        })

      if (uploadError?.message === 'The resource already exists') {
        toast.error('Error', {
          description: uploadError?.message as string
        })
        throw uploadError.message
      }

      if (uploadError) {
        throw new Error(`Image upload failed: ${uploadError.message}`)
      }

      // Get public URL for the uploaded image
      const {
        data: { publicUrl }
      } = supabase.storage.from(bucket).getPublicUrl(storageName)

      imageUrls.push(publicUrl)
    }
  }

  return {
    imageUrls
  }
}

export const removeImage = async (
  images: File[],
  supabase: SupabaseClient,
  projectId: string,
  bucket = 'business'
): Promise<void> => {
  if (images && images.length > 0) {
    for (const image of images) {
      const fileName = image?.name as string
      const storageName = `${projectId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .remove([storageName])

      if (uploadError) {
        throw new Error(`Image remove failed: ${uploadError.message}`)
      }
    }
  }
}
