'use client'

import { JSX, useTransition } from 'react'
import { claimingPrize } from '@/supabase/db/prizes'
import { TicketCheck } from 'lucide-react'
import { CustomButton } from '@/components/custom/CustomButton'
import { Badge } from '@/components/ui/badge'
import { Card, CardTitle, CardContent, CardHeader } from '@/components/ui/card'
import { PrizesTable } from '@/lib/types/prizes'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface PrizesCard extends PrizesTable {
  userCredit: number
  userId: string
}

export function PrizesCard({
  image,
  name,
  credit_cost: creditCost,
  claimed_by: claimedBy,
  userCredit,
  id: prizeId,
  userId
}: PrizesCard): JSX.Element {
  const [isPending, startTransition] = useTransition()

  const isUserClaimed = claimedBy?.id === userId
  const claimedMessage = !!claimedBy
    ? isUserClaimed
      ? 'You claimed this prize'
      : 'Somebody already claimed this prize'
    : `Redeem prize for ${creditCost} credits`

  const claimedStatus = !!claimedBy ? 'not active' : 'active'
  const notEnoughCredits = userCredit < Number(creditCost) && !isUserClaimed
  const isDisabledButton = !!claimedBy || notEnoughCredits || isPending
  const router = useRouter()

  const claimPrize = async (): Promise<void> => {
    startTransition(async () => {
      await claimingPrize(userId, prizeId, Number(creditCost))
      router.refresh()
    })
  }

  return (
    <Card className='p-0'>
      <CardHeader className='p-0'>
        <Image
          src={image as string}
          width={500}
          height={200}
          className='rounded-t-lg object-cover h-50 w-full'
          alt='test'
        />
        <CardContent className='px-4 py-4'>
          <div className='space-y-2 text-primary space-y-4'>
            <CardTitle className='flex items-center justify-between'>
              <h1>{name}</h1>
              <Badge
                variant='secondary'
                className={`${claimedStatus === 'not active' ? 'bg-gray-500/80' : 'bg-green-500/80'} text-white`}
              >
                {claimedStatus}
              </Badge>
            </CardTitle>
            <CustomButton
              className='w-full'
              disabled={isDisabledButton}
              isLoading={isPending}
              onClick={claimPrize}
            >
              <TicketCheck />
              {notEnoughCredits ? 'Not enough credits' : claimedMessage}
            </CustomButton>
          </div>
        </CardContent>
      </CardHeader>
    </Card>
  )
}
