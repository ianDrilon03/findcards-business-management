import { createClient } from '@/config/client'
import { toast } from 'sonner'

export const addCategory = async (name: string): Promise<void> => {
  try {
    const supabase = createClient()

    const { error } = await supabase.from('category').insert({
      name
    })

    if (error) {
      toast.error('Error!', {
        description: 'Something whent wrong.'
      })
      throw error.message
    }

    toast('Successfully', {
      description: 'Successfully created category.'
    })
  } catch (error) {
    throw error
  }
}

export const editCategory = async (name: string, id: string): Promise<void> => {
  try {
    const supabase = createClient()

    const { error } = await supabase
      .from('category')
      .update({
        name
      })
      .eq('id', id)

    if (error) {
      toast.error('Error!', {
        description: 'Something whent wrong.'
      })
      throw error.message
    }

    toast('Successfully', {
      description: 'Successfully updated category.'
    })
  } catch (error) {
    throw error
  }
}

export const archivedCategory = async (id: string): Promise<void> => {
  try {
    const supabase = createClient()
    const today = new Date()

    const { error } = await supabase
      .from('category')
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
      description: 'Successfully removing category.'
    })
  } catch (error) {
    throw error
  }
}
