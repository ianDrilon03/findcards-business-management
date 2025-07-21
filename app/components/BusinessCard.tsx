import { JSX } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BadgeCheck, MapPin, User, Phone, Verified } from 'lucide-react'
import Image from 'next/image'

export const BusinessCard = (): JSX.Element => {
  return (
    <Card className='p-0'>
      <CardHeader className='p-0'>
        <Image
          src='http://127.0.0.1:54321/storage/v1/object/public/businesses//pexels-bohlemedia-1884573.jpg'
          width={500}
          height={200}
          className='rounded-t-lg object-cover h-50'
          alt='test'
        />
        <CardContent className='px-4 py-4 space-y-4'>
          <div className='space-y-2'>
            <CardTitle className='flex items-center justify-between'>
              <h1>Sample title</h1>
              <BadgeCheck className='w-5 h-5 fill-primary text-white' />
            </CardTitle>
            <h2 className='text-gray-400 flex items-center gap-1 text-sm'>
              <Phone className='w-4 h-4' />
              09283392164
            </h2>

            <Badge variant='outline'>technology</Badge>
            <p className='text-gray-400 flex items-center gap-1 text-sm'>
              <MapPin className='w-4 h-4' />
              123 Business Ave, Tech City, TC 12345
            </p>
          </div>

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
        </CardContent>
      </CardHeader>
    </Card>
  )
}
