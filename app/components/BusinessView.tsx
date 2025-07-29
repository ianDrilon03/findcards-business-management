'use client'

import { JSX, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import {
  Phone,
  MapPin,
  Mail,
  Globe,
  InstagramIcon,
  EllipsisVertical,
  VerifiedIcon,
  Trash
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { avatarName } from '@/helpers/avatarName'
import { BusinessDetailsDB } from '@/lib/types/business'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  archiveBusiness,
  unverifiedBusiness,
  verifiedBusiness
} from '@/supabase/db/business'
import { useAlertDialog } from '@/service/alert-dialog'
import { useShallow } from 'zustand/react/shallow'
import { DialogAlert } from '@/components/custom/DialogAlert'

interface BusinessView extends BusinessDetailsDB {
  businessId?: string
}

export function BusinessView({
  businesses,
  category,
  personal_email,
  first_name: firstName,
  last_name: lastName,
  businessId,
  referred_by: referredBy
}: BusinessView): JSX.Element {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const state = useAlertDialog(
    useShallow((state) => ({
      open: state.open,
      type: state.type,
      toggleOpen: state.toggleOpenDialog
    }))
  )
  const name = `${firstName} ${lastName}`

  const pathname = usePathname()
  const isUser = pathname.split('/')[1] === 'users'

  const onVerifiy = async (): Promise<void> => {
    startTransition(async () => {
      await verifiedBusiness(businesses.id, referredBy?.id as string)
      state.toggleOpen?.(false, null)
      router.refresh()
    })
  }

  const onUnVerified = async (): Promise<void> => {
    startTransition(async () => {
      await unverifiedBusiness(businesses.id, referredBy?.id as string)
      state.toggleOpen?.(false, null)
      router.refresh()
    })
  }

  const onArchive = async (): Promise<void> => {
    startTransition(async () => {
      await archiveBusiness(businessId as string)
      state.toggleOpen?.(false, null)
      router.refresh()
      router.back()
    })
  }

  const isVerified = businesses.status === 'verified'

  return (
    <>
      <Card className='p-0 text-primary'>
        <CardHeader className='p-0'>
          <Image
            src={businesses.image}
            width={1000}
            height={1000}
            quality={80}
            className='w-full h-[30rem] object-cover rounded-lg'
            alt='test'
          />

          <CardContent className='pb-4 pt-2'>
            <div className='flex items-center justify-between'>
              <section>
                <CardTitle className='text-2xl'>{businesses.name}</CardTitle>
                <span className='text-sm text-gray-500'>{category.name}</span>
              </section>

              <div className='flex items-center gap-2'>
                <Badge variant='secondary'>{businesses.status}</Badge>
                {!isUser && (
                  <div className='flex items-center gap-2'>
                    <Link href={`mailto:${businesses.email}`}>
                      <Button type='button' className='cursor-pointer'>
                        <Phone />
                        Contact Business
                      </Button>
                    </Link>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <EllipsisVertical className='w-5 h-5 text-gray-600 cursor-pointer' />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className='w-[--radix-dropdown-menu-trigger-width] min-w-30 rounded-lg'
                        side='bottom'
                        align='end'
                        sideOffset={4}
                      >
                        <DropdownMenuItem
                          onClick={() => state.toggleOpen?.(true, 'verified')}
                        >
                          <VerifiedIcon />
                          {!isVerified ? 'Verify' : 'Unverify'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            state.toggleOpen?.(true, 'remove-business')
                          }
                        >
                          <Trash />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
            </div>

            <main className='mt-2 sm:flex space-y-5 sm:space-y-2'>
              <div className='space-y-2 flex-1 space-y-3'>
                <h1 className='text-lg font-bold'>Owner Information</h1>

                <section className='flex items-center gap-2'>
                  <Avatar className='h-8 w-8 rounded-full'>
                    <AvatarFallback className='rounded-lg fill-primary bg-primary text-white font-semibold'>
                      {avatarName(personal_email)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className='font-medium text-md'>{name}</h1>
                    <h2 className='text-gray-500 text-sm'>Business owner</h2>
                  </div>
                </section>

                <section className='space-y-2'>
                  <h1 className='text-lg font-bold'>Social Media</h1>

                  <div className='flex items-center gap-2'>
                    <Link
                      href={businesses.website}
                      target='_blank'
                      className='bg-primary/50 hover:bg-primary p-2 rounded-full'
                    >
                      <Globe className='text-white w-5 h-5' />
                    </Link>
                    <Link
                      href={businesses.social_media}
                      target='_blank'
                      className='bg-primary/50 hover:bg-primary p-2 rounded-full'
                    >
                      <InstagramIcon className='text-white w-5 h-5' />
                    </Link>
                  </div>
                </section>
              </div>

              <div className='space-y-2 flex-1'>
                <h1 className='text-lg font-bold'>Contact Information</h1>

                <section className='space-y-3'>
                  <div className='text-gray-500 flex items-center gap-2'>
                    <MapPin className='w-5 h-5' />
                    <span className='text-md w-1/2'>{businesses.address}</span>
                  </div>

                  <div className='text-gray-500 flex items-center gap-2'>
                    <Phone className='w-5 h-5' />
                    <span className='text-md w-1/2'>{businesses.phone}</span>
                  </div>

                  <div className='text-gray-500 flex items-center gap-2'>
                    <Mail className='w-5 h-5' />
                    <span className='text-md w-1/2'>{businesses.email}</span>
                  </div>
                </section>
              </div>
            </main>
          </CardContent>
        </CardHeader>
      </Card>
      <DialogAlert
        open={state.open && state.type === 'verified'}
        title={isVerified ? 'Unverified Business' : 'Verified Business'}
        description={`Do you want to ${isVerified ? 'unverified' : 'verify'} this business?`}
        callback={isVerified ? onUnVerified : onVerifiy}
        cancel={() => state.toggleOpen?.(false, null)}
        isLoading={isPending}
        type='success'
      />
      <DialogAlert
        open={state.open && state.type === 'remove-business'}
        title='Remove business'
        description='Do you want to remove this business?'
        callback={onArchive}
        cancel={() => state.toggleOpen?.(false, null)}
        type='error'
        isLoading={isPending}
      />
    </>
  )
}
