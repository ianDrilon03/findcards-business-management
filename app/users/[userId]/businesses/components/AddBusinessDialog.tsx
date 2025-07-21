'use client'

import { JSX, ReactNode } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { useBusinessDetails } from '@/service/business'

import { PersonalInformation } from './PersonalInformation'
import { BusinessInformation } from './BusinessInformation'

interface AddBusinessDialog {
  children: ReactNode
}

const renderComponent: { [key: string]: ReactNode } = {
  'business-info': <BusinessInformation />,
  'personal-info': <PersonalInformation />
}

export const AddBusinessDialog = ({
  children
}: AddBusinessDialog): JSX.Element => {
  const step = useBusinessDetails((state) => state.step)

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='lg:max-w-[60rem] sm:max-w-[30rem] h-auto overflow-auto custom-scrollbar'>
        <DialogHeader>
          <DialogTitle>Add Business</DialogTitle>
        </DialogHeader>

        {renderComponent[step]}
      </DialogContent>
    </Dialog>
  )
}
