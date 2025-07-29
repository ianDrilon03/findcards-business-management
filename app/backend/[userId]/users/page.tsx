import { JSX } from 'react'
import { createClient } from '@/config'
import { Container } from '@/components/custom/Container'
import { UsersTable } from './components/UserTable'
import { AddUserDialog } from './components/AddUserDialog'

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
    <Container title='Manage Users' description='You can manage users here'>
      <UsersTable user={data} />
      <AddUserDialog />
    </Container>
  )
}
