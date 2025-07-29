import { JSX } from 'react'
import { getUserDetails } from '@/supabase/db/auth'
import { createClient } from '@/config'
import { PrizesCard } from './components/PrizesCard'
import { PrizesTable } from '@/lib/types/prizes'
import { Container } from '@/components/custom/Container'

export default async function RedeemPrizes({
  params
}: {
  params: Promise<{ userId: string }>
}): Promise<JSX.Element> {
  const { userId } = await params
  const supabase = await createClient()

  const userDetails = await getUserDetails(userId)

  const { data, error } = await supabase
    .from('prizes')
    .select(
      'id, claimed_by:users(id, name, email, gender, address, phone, avatar), name, image, credit_cost, status, created_at, updated_at'
    )
    .is('archived_at', null)
    .eq('status', 'published')
    .returns<PrizesTable[]>()

  if (error) {
    throw error.message
  }

  return (
    <Container
      title='Available Prizes'
      description='Redeem your credits for exciting prizes'
      childClassName='grid xl:grid-cols-4 md:grid-cols-2 xs:grid-cols-1 gap-2'
    >
      {data.map((item) => (
        <PrizesCard
          {...item}
          key={item.id}
          userCredit={Number(userDetails.credits)}
          userId={userId}
        />
      ))}
    </Container>
  )
}
