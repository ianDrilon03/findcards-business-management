import { JSX } from 'react'
import { Container } from '@/components/custom/Container'
import { createClient } from '@/config'
import { BusinessDetailsDB } from '@/lib/types/business'
import { BusinessView } from '@/app/components/BusinessView'

export default async function ViewBusiness({
  params
}: {
  params: Promise<{ businessId: string }>
}): Promise<JSX.Element> {
  const { businessId } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('business_personal_details')
    .select(
      `id, first_name, last_name, personal_email, phone, 
      businesses(id, name, address, phone, address, image, status, email, website, region, social_media ), 
      category(name)`
    )
    .order('created_at', { ascending: false })
    .eq('id', businessId)
    .single()
    .returns<BusinessDetailsDB>()

  if (error) {
    throw error.message
  }

  return (
    <Container
      title='Businesses Info'
      description='You can see Business Information here'
      className='container space-y-2'
    >
      <BusinessView {...data} />
    </Container>
  )
}
