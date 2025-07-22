'use client'

import { JSX } from 'react'
import Image from 'next/image'
import { useBusinessDetails } from '@/service/business'
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'

export function EmptyPlaceholder(): JSX.Element {
  const toggleOpen = useBusinessDetails((state) => state.toggleOpenDialog)

  return (
    <div className='flex flex-col items-center justify-center h-[85vh]'>
      <Image
        src='/images/empty-data.svg'
        alt='empty placeholder'
        width={900}
        height={900}
        className='size-100'
      />
      <div className='space-y-2 text-center'>
        <h1 className='text-2xl font-bold'>Add Your First Business</h1>
        <p className='text-sm text-gray-500'>
          Add your first business by clicking the button below 😊
        </p>

        <Button
          type='button'
          className='mt-4'
          onClick={() => toggleOpen?.(true)}
        >
          <PlusIcon />
          Add Business
        </Button>
      </div>
    </div>
  )
}
