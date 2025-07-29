import { JSX } from 'react'
import { Container } from '@/components/custom/Container'
import { createClient } from '@/config'
import { BusinessAction } from './components/BusinessAction'
import { AddBusinessDialog } from './components/AddBusinessDialog'
import { BusinessCard } from '@/app/components/BusinessCard'
import { BusinessDetailsDB } from '@/lib/types/business'
import { EmptyPlaceholder } from './components/EmptyPlaceholder'

export default async function Businesses({
  params
}: {
  params: Promise<{ userId: string }>
}): Promise<JSX.Element> {
  const { userId } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('business_personal_details')
    .select(
      `id, businesses(name, address, phone, address, image, status), category(name)`
    )
    .order('created_at', { ascending: false })
    .eq('referred_by', userId)
    .returns<Pick<BusinessDetailsDB, 'businesses' | 'category' | 'id'>[]>()

  if (error) {
    throw error.message
  }

  return (
    <Container
      title='Businesses'
      description='You can see verified and unverified businesses here'
      className='container space-y-2'
    >
      {data.length > 0 && <BusinessAction />}
      <section className='grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-2'>
        {data.map((item) => (
          <BusinessCard {...item} key={item.id} />
        ))}
      </section>
      {data.length <= 0 && <EmptyPlaceholder />}
      <AddBusinessDialog />
    </Container>
  )
}
