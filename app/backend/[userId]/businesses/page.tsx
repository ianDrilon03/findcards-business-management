import { JSX } from 'react'
import { EmptyPlaceholder } from '@/app/users/[userId]/businesses/components/EmptyPlaceholder'
import { BusinessCard } from '@/app/components/BusinessCard'
import { BusinessDetailsDB } from '@/lib/types/business'
import { Container } from '@/components/custom/Container'
import { createClient } from '@/config'

export default async function BusinessesPage(): Promise<JSX.Element> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('business_personal_details')
    .select(
      `id, businesses(id, name, address, phone, address, image, status), category(name)`
    )
    .order('created_at', { ascending: false })
    .is('archived_at', null)
    .returns<Pick<BusinessDetailsDB, 'businesses' | 'category' | 'id'>[]>()

  if (error) {
    throw error.message
  }

  return (
    <Container
      title='Manage Businesses'
      description='You can manage businesses here'
    >
      <div className='my-8 space-y-2'>
        <section className='grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-2'>
          {data.map((item) => (
            <BusinessCard {...item} key={item.id} />
          ))}
        </section>
        {data.length <= 0 && <EmptyPlaceholder isShowButton={false} />}
      </div>
    </Container>
  )
}
