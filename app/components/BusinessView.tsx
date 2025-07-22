import { JSX } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'

export function BusinessView(): JSX.Element {
  return (
    <Card className='max-w-5xl w-full mx-auto mt-14 p-0'>
      <CardHeader className='p-0'>
        <Image
          src='http://127.0.0.1:54321/storage/v1/object/public/business/6f526a43-fc13-408c-88f5-04d22db86d7b/New%20Business/pexels-apgpotr-683039.jpg'
          width={1000}
          height={1000}
          quality={80}
          className='w-full h-[30rem] object-cover rounded-lg'
          alt='test'
        />

        <CardContent className='pb-4 pt-2'>
          <section>
            <CardTitle className='text-2xl'>Ocean View Restaurant</CardTitle>
            <span className='text-sm text-gray-500'>Health and Fitness</span>
          </section>

          <main></main>
        </CardContent>
      </CardHeader>
    </Card>
  )
}
