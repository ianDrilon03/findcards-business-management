import { JSX } from 'react'
import { PreviousButton } from '@/components/custom/PreviousButton'
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
    <div className='mt-4 max-w-4xl mx-auto space-y-2'>
      <PreviousButton />
      <SettingsForm {...userData.users} userId={userId} />
    </div>
  )
}
