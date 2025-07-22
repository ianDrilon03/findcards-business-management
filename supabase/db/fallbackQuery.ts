import { SupabaseClient } from '@supabase/supabase-js'

export const fallbackDelete = async (
  id: string,
  table: string,
  supabase: SupabaseClient
): Promise<void> => {
  try {
    await supabase.from(table).delete().eq('id', id)
  } catch (error) {
    throw error
  }
}
