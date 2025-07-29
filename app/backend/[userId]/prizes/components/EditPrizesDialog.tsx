'use client'

import { JSX, useTransition, useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { ImageUpload } from '@/components/custom/ImageUpload'
import { useCreatePrizesDialog } from '@/service/create-prizes-dialog'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CustomButton } from '@/components/custom/CustomButton'
import { useRouter } from 'next/navigation'
import { useShallow } from 'zustand/react/shallow'
import { PrizesForm } from '@/lib/types/prizes'
import { Controller } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { prizesStatus } from '../helpers/constant'
import { useUser } from '@/context/AuthProvider'
import { User } from '@supabase/supabase-js'
import { editPrize } from '@/supabase/db/prizes'

export function EditPrizesDialog(): JSX.Element {
  const router = useRouter()
  const { user } = useUser() as { user: User }
  const [oldImagePath, setOldImagePath] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const {
    open,
    toggleOpen,
    data: prizesData
  } = useCreatePrizesDialog(
    useShallow((state) => ({
      open: state.open,
      data: state.data,
      toggleOpen: state.toggleOpenDialog
    }))
  )

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
    control
  } = useForm<PrizesForm>()

  const resetVariable = (): void => {
    reset({
      name: ''
    })
    router.refresh()
    toggleOpen?.(false, null)
  }

  const onSubmit = async (data: PrizesForm): Promise<void> => {
    startTransition(async () => {
      await editPrize(
        data,
        user.id,
        prizesData?.id as string,
        oldImagePath as string
      )
      resetVariable()
    })
  }

  useEffect(() => {
    if (!!prizesData) {
      reset({
        name: prizesData?.name as string,
        status: prizesData?.status,
        credit_cost: prizesData?.creditCost.toString(),
        image: prizesData?.image
      })

      if (typeof prizesData?.image === 'string') {
        const path = prizesData?.image.split('/prizes/')[1]

        setOldImagePath(path)
      }
    }
  }, [reset, prizesData])

  const isOpen = open && !!prizesData?.name

  return (
    <Dialog open={isOpen} onOpenChange={() => toggleOpen?.(false, null)}>
      <DialogContent className='sm:max-w-[40rem]'>
        <DialogHeader>
          <DialogTitle>Edit Prize</DialogTitle>
        </DialogHeader>
        <div className='grid grid-cols-2 gap-2'>
          <Input
            title='Name'
            {...register('name', {
              required: 'Field is required.'
            })}
            hasError={!!errors.name}
            errorMessage={errors.name?.message}
          />

          <Input
            title='Credit Cost'
            type='number'
            {...register('credit_cost', {
              required: 'Field is required.'
            })}
            hasError={!!errors.credit_cost}
            errorMessage={errors.credit_cost?.message}
          />
        </div>

        <div className='space-y-2'>
          <Label className='text-sm font-medium mb-1.5'>Status</Label>
          <Controller
            name='status'
            control={control}
            render={({ field: { onChange, value } }) => (
              <Select
                value={value as string}
                onValueChange={(e) => onChange(e)}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select Status' />
                </SelectTrigger>
                <SelectContent>
                  {prizesStatus.map((item, index) => (
                    <SelectItem key={`${item}-${index}`} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {!!errors.status && (
            <h1 className='text-sm text-red-500'>{errors.status.message}</h1>
          )}
        </div>

        <div className='space-y-2'>
          <Controller
            name='image'
            control={control}
            render={({ field: { onChange, value } }) => (
              <ImageUpload
                filePreview={typeof value === 'string' ? value : undefined}
                title='Image'
                pendingFiles={value as File[]}
                isLoading={isPending}
                acceptedImageCount={1}
                setPendingFiles={(value) => onChange(value)}
              />
            )}
          />
          {!!errors.image && (
            <h1 className='text-sm text-red-500'>{errors.image.message}</h1>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button
              type='button'
              variant='outline'
              onClick={() => resetVariable()}
            >
              Cancel
            </Button>
          </DialogClose>

          <DialogClose asChild>
            <CustomButton
              type='button'
              onClick={handleSubmit(onSubmit)}
              disabled={isPending}
              isLoading={isPending}
            >
              Update
            </CustomButton>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
