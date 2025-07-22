'use client'

import { JSX } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BusinessDetailsDB } from '@/lib/types/business'
import { usePathname } from 'next/navigation'
import { MapPin, Phone, Verified } from 'lucide-react'
import Image from 'next/image'

export function BusinessCard({
  businesses,
  category
}: Pick<BusinessDetailsDB, 'businesses' | 'category'>): JSX.Element {
  const { image, name, phone, address, status } = businesses

  const pathname = usePathname()
  const isUser = pathname.split('/')[1] === 'users'

  return (
    <Card className='p-0 cursor-pointer'>
      <CardHeader className='p-0'>
        <Image
          src={image}
          width={500}
          height={200}
          className='rounded-t-lg object-cover h-50 w-full'
          alt='test'
        />
        <CardContent className='px-4 py-4 space-y-4'>
          <div className='space-y-2'>
            <CardTitle className='flex items-center justify-between'>
              <h1>{name}</h1>
              <Badge variant='secondary'>{status}</Badge>
            </CardTitle>
            <h2 className='text-gray-400 flex items-center gap-1 text-sm'>
              <Phone className='w-4 h-4' />
              {phone}
            </h2>

            <Badge variant='outline'>{category.name}</Badge>
            <p className='text-gray-400 flex items-center gap-1 text-sm'>
              <MapPin className='w-4 h-4' />
              {address}
            </p>
          </div>

          {!isUser && (
            <section className='flex items-center justify-end gap-2'>
              <Button variant='outline' className='w-fit'>
                Edit
              </Button>
              <Button variant='outline' className='w-fit'>
                Delete
              </Button>
              <Button variant='default' className='w-fit'>
                <Verified />
                Verified
              </Button>
            </section>
          )}
        </CardContent>
      </CardHeader>
    </Card>
  )
}
