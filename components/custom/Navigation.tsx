'use client'

import { JSX } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { usePathname, permanentRedirect } from 'next/navigation'
import { signOut } from '@/supabase/db/authClient'
import { ChevronDown, Settings, LogOut, Coins, TicketCheck } from 'lucide-react'
import { avatarName } from '@/helpers/avatarName'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { UserCredits } from '@/lib/types/user'
import { appName } from '@/helpers/constants'

export const Navigation = ({ users, credits }: UserCredits): JSX.Element => {
  const { email, avatar } = users
  const pathname = usePathname()
  const activeTeam = appName(email as string)[0]
  const baseUrl = pathname.split('/')

  const defaultPath = `/users/${baseUrl[2]}`

  const redirectSettings = (): void => {
    permanentRedirect(`${defaultPath}/settings`)
  }

  const redirectPrizes = (): void => {
    permanentRedirect(`${defaultPath}/redeem-prizes`)
  }

  return (
    <div className='bg-white shadow-sm p-4 flex justify-between'>
      <section className='flex gap-2 items-center'>
        <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-sidebar-primary-foreground'>
          <activeTeam.logo className='size-4' />
        </div>
        <div className='grid flex-1 text-left text-sm leading-tight'>
          <span className='truncate font-semibold'>{activeTeam.name}</span>
        </div>
      </section>

      <main className='flex items-center gap-2'>
        <div className='flex items-center gap-2 mr-4'>
          <Coins className='text-green-500' />
          <span className='rounded-full px-2 bg-green-500 text-white'>
            {credits}
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <main className='flex items-center gap-2 cursor-pointer'>
              <Avatar className='h-8 w-8 rounded-full'>
                <AvatarImage
                  src={avatar}
                  alt={email}
                  className='object-cover'
                />
                <AvatarFallback className='rounded-lg fill-primary bg-primary text-white font-semibold'>
                  {avatarName(email)}
                </AvatarFallback>
              </Avatar>

              <h1 className='text-gray-500 text-sm'>{email}</h1>

              <ChevronDown className='ml-auto size-4' />
            </main>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
            side='bottom'
            align='end'
            sideOffset={4}
          >
            <DropdownMenuItem onClick={() => redirectSettings()}>
              <Settings />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => redirectPrizes()}>
              <TicketCheck />
              Redeem Prizes
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </main>
    </div>
  )
}
