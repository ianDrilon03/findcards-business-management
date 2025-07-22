'use client'

import { JSX } from 'react'
import { Plus } from 'lucide-react'
import { useBusinessDetails } from '@/service/business'
import { Button } from '@/components/ui/button'

export function BusinessAction(): JSX.Element {
  const toggleOpen = useBusinessDetails((state) => state.toggleOpenDialog)

  return (
    <div className='text-right'>
      <Button className='cursor-pointer' onClick={() => toggleOpen?.(true)}>
        <Plus />
        Add Business
      </Button>
    </div>
  )
}
