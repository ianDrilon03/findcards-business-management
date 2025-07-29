import { JSX } from 'react'
import { Container } from '@/components/custom/Container'
import { getUserDetails } from '@/supabase/db/auth'
import { SettingsForm } from '@/app/backend/[userId]/settings/components/SettingsForm'

export default async function SettingsPage({
  params
}: {
  params: Promise<{ userId: string }>
}): Promise<JSX.Element> {
  const { userId } = await params
  const userData = await getUserDetails(userId)

  return (
    <Container
      title='Profile Settings'
      description='You can edit your profile settings here'
      className='mt-4 max-w-4xl mx-auto space-y-2'
    >
      <SettingsForm {...userData.users} userId={userId} />
    </Container>
  )
}
