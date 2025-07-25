'use client'

import { JSX, ReactNode } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { useBusinessDetails } from '@/service/business'
import { PersonalInformation } from './PersonalInformation'
import { BusinessInformation } from './BusinessInformation'
import { useShallow } from 'zustand/react/shallow'

const renderComponent: { [key: string]: ReactNode } = {
  'business-info': <BusinessInformation />,
  'personal-info': <PersonalInformation />
}

export function AddBusinessDialog(): JSX.Element {
  const state = useBusinessDetails(
    useShallow((state) => ({
      step: state.step,
      open: state.open,
      toggleOpen: state.toggleOpenDialog
    }))
  )

  return (
    <Dialog open={state.open} onOpenChange={() => state?.toggleOpen?.(false)}>
      <DialogContent className='lg:max-w-[60rem] sm:max-w-[30rem] h-auto overflow-auto custom-scrollbar'>
        <DialogHeader>
          <DialogTitle>Add Business</DialogTitle>
        </DialogHeader>

        {renderComponent[state.step]}
      </DialogContent>
    </Dialog>
  )
}
