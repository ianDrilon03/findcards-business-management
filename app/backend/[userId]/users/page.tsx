import { JSX } from 'react'
import { createClient } from '@/config'
import { Container } from '@/components/custom/Container'
import { UsersTable } from './components/UserTable'

export default async function Users(): Promise<JSX.Element> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('users')
    .select('id, name, avatar, email, role, gender, address, phone')
    .order('role', { ascending: true })

  if (error) {
    console.error(error.message)
    throw error.message
  }

  return (
    <Container
      title='Manage Users'
      description='You can manage users here (e.g, revoke, reinstate, ban, edit)'
    >
      <UsersTable user={data} />
    </Container>
  )
}
