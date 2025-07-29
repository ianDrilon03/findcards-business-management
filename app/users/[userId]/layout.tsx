import { AuthProvider } from '@/context/AuthProvider'
import { Navigation } from '@/components/custom/Navigation'
import { ReactNode } from 'react'
import { getUserDetails } from '@/supabase/db/auth'

export default async function Layout({
  children,
  params
}: {
  children: ReactNode
  params: Promise<{ userId: string }>
}) {
  const { userId } = await params
  const data = await getUserDetails(userId)

  return (
    <AuthProvider>
      <Navigation {...data} />
      <div className='flex flex-1 flex-col gap-4 p-4 min-w-md mx-auto w-full container'>
        {children}
      </div>
    </AuthProvider>
  )
}
