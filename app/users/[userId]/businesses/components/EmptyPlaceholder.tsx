'use client'

import { JSX } from 'react'
import Image from 'next/image'
import { useBusinessDetails } from '@/service/business'
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'

export function EmptyPlaceholder({
  isShowButton = true
}: {
  isShowButton?: boolean
}): JSX.Element {
  const toggleOpen = useBusinessDetails((state) => state.toggleOpenDialog)

  const description =
    isShowButton && 'Add your first business by clicking the button below 😊'

  const title = isShowButton ? 'Add Your First Business' : 'No Data Found'

  return (
    <div className='flex flex-col items-center justify-center h-full'>
      <Image
        src='/images/empty-data.svg'
        alt='empty placeholder'
        width={900}
        height={900}
        className='size-100'
      />
      <div className='space-y-2 text-center'>
        <h1 className='text-2xl font-bold'>{title}</h1>
        <p className='text-sm text-gray-500'>{description}</p>

        {isShowButton && (
          <Button
            type='button'
            className='mt-4'
            onClick={() => toggleOpen?.(true)}
          >
            <PlusIcon />
            Add Business
          </Button>
        )}
      </div>
    </div>
  )
}
