'use client'

import { JSX, useTransition } from 'react'
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
import { addPrize } from '@/supabase/db/prizes'
import { ImageUpload } from '@/components/custom/ImageUpload'
import { Label } from '@/components/ui/label'
import { Controller } from 'react-hook-form'
import { useCreatePrizesDialog } from '@/service/create-prizes-dialog'
import { useUser } from '@/context/AuthProvider'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CustomButton } from '@/components/custom/CustomButton'
import { useRouter } from 'next/navigation'
import { useShallow } from 'zustand/react/shallow'
import { PrizesForm } from '@/lib/types/prizes'
import { User } from '@supabase/supabase-js'

const status = ['published', 'draft']

export function AddPrizesDialog(): JSX.Element {
  const router = useRouter()
  const { user } = useUser() as { user: User }
  const [isPending, startTransition] = useTransition()

  const { open, toggleOpen, data } = useCreatePrizesDialog(
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
    control,
    setError
  } = useForm<PrizesForm>()

  const resetVariable = (): void => {
    reset({
      name: ''
    })
    router.refresh()
    toggleOpen?.(false, null)
  }

  const onSubmit = async (data: PrizesForm): Promise<void> => {
    const { status, image } = data

    if (!image) {
      setError('image', {
        message: 'This is required'
      })
      return
    }

    if (!status) {
      setError('status', {
        message: 'This is required'
      })
      return
    }

    startTransition(async () => {
      await addPrize(data, user.id)
      resetVariable()
    })
  }

  const isOpen = open && !data

  return (
    <Dialog open={isOpen} onOpenChange={() => toggleOpen?.(false, null)}>
      <DialogContent className='sm:max-w-[40rem]'>
        <DialogHeader>
          <DialogTitle>Add New Prize</DialogTitle>
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
              <Select value={value} onValueChange={(e) => onChange(e)}>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select Status' />
                </SelectTrigger>
                <SelectContent>
                  {status.map((item, index) => (
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
              Create
            </CustomButton>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
