import { JSX } from 'react'
import { createClient } from '@/config'
import { PrizesTable } from '@/lib/types/prizes'
import { PrizeTable } from './components/PrizesTable'
import { Container } from '@/components/custom/Container'
import { AddPrizesDialog } from './components/AddPrizesDialog'
import { EditPrizesDialog } from './components/EditPrizesDialog'

export default async function PrizesPage(): Promise<JSX.Element> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('prizes')
    .select(
      'id, claimed_by:users(name, email, gender, address, phone, avatar), name, image, credit_cost, status, created_at, updated_at'
    )
    .is('archived_at', null)
    .returns<PrizesTable[]>()

  if (error) {
    throw error.message
  }

  return (
    <Container
      title='Prizes Management'
      description='You can manage all the prizes here'
    >
      <PrizeTable prizes={data} />
      <AddPrizesDialog />
      <EditPrizesDialog />
    </Container>
  )
}
