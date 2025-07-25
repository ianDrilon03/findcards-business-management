'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/config/client'
import { CategoryDB } from '../types/category'

interface UseCategory {
  category: CategoryDB[]
}

export const useCategory = (): UseCategory => {
  const [category, setCategory] = useState<CategoryDB[]>([])
  const [mount, setMount] = useState<boolean>(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      const { data, error } = await supabase
        .from('category')
        .select('id, name, created_at, updated_at, archived_at')
        .returns<CategoryDB[]>()

      if (error) {
        throw error.message
      }

      setCategory(data)
      setMount(false)
    }

    if (mount) {
      fetchData()
    }
  }, [mount, supabase])

  return {
    category
  }
}
