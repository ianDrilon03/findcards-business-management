import { Container } from '@/components/custom/Container'
import { SettingsForm } from './components/SettingsForm'
import { getUserDetails } from '@/supabase/db/auth'
import { JSX } from 'react'

export default async function SettingsPage({
  params
}: {
  params: Promise<{ userId: string }>
}): Promise<JSX.Element> {
  const { userId } = await params
  const userData = await getUserDetails(userId)

  return (
    <Container
      title='Settings Page'
      description='You can update your profile details here'
    >
      <div className='max-w-4xl mx-auto w-full'>
        <SettingsForm {...userData.users} userId={userId} />
      </div>
    </Container>
  )
}
