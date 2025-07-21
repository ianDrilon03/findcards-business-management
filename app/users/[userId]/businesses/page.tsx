import { JSX } from 'react'
import { BusinessAction } from './components/BusinessAction'
import { BusinessCard } from '@/app/components/BusinessCard'

export default function Businesses(): JSX.Element {
  return (
    <div className='my-8 space-y-2'>
      <BusinessAction />
      <section className='grid grid-cols-4 gap-2'>
        <BusinessCard />
      </section>
    </div>
  )
}
