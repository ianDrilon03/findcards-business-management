import { JSX } from 'react'
import { Plus } from 'lucide-react'
import { AddBusinessDialog } from './AddBusinessDialog'
import { Button } from '@/components/ui/button'

export const BusinessAction = (): JSX.Element => {
  return (
    <div className='text-right'>
      <AddBusinessDialog>
        <Button className='cursor-pointer'>
          <Plus />
          Add Business
        </Button>
      </AddBusinessDialog>
    </div>
  )
}
