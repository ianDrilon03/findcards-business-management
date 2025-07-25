'use client'

import { JSX } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BusinessDetailsDB } from '@/lib/types/business'
import { usePathname } from 'next/navigation'
import { MapPin, Phone } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export function BusinessCard({
  businesses,
  category,
  id
}: Pick<BusinessDetailsDB, 'businesses' | 'category' | 'id'>): JSX.Element {
  const { image, name, phone, address, status } = businesses

  const pathname = usePathname()

  return (
    <Link href={`${pathname}/${id}`}>
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
          </CardContent>
        </CardHeader>
      </Card>
    </Link>
  )
}
