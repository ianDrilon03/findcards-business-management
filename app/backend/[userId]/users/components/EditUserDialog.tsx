'use client'

import { JSX, useState, useEffect, useTransition } from 'react'
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
import { Controller, useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { CustomButton } from '@/components/custom/CustomButton'
import { ImageUpload } from '@/components/custom/ImageUpload'
import { updateUser } from '@/supabase/db/authClient'
import { SettingsForm as SettingsFormType } from '@/supabase/db/auth'
import { useUserActionDialog } from '@/service/user-action-dialog'
import { useRouter } from 'next/navigation'
import { useShallow } from 'zustand/react/shallow'

export function EditUserDialog(): JSX.Element {
  const router = useRouter()
  const [previews, setPreviews] = useState<File[]>([])
  const [isPending, startTransition] = useTransition()

  const { open, mode, user, toggleOpen } = useUserActionDialog(
    useShallow((state) => ({
      open: state.open,
      mode: state.mode,
      user: state.user,
      toggleOpen: state.toggleOpenDialog
    }))
  )

  const {
    control,
    register,
    reset,
    setError,
    handleSubmit,
    formState: { errors }
  } = useForm<SettingsFormType>()

  useEffect(() => {
    if (!!user) {
      reset({
        name: user.name,
        phone: user.phone,
        address: user.address,
        gender: user.gender,
        role: user.role,
        email: user.email,
        avatar: user.avatar
      })
    }
  }, [reset, user])

  const resetVariable = (): void => {
    setPreviews([])
    router.refresh()
    toggleOpen?.(false, null, null)
  }

  const onSubmit = async (data: SettingsFormType): Promise<void> => {
    startTransition(async () => {
      if (previews.length <= 0 && !data.avatar) {
        setError('avatar', {
          message: 'This is required.'
        })
        return
      }

      const path = data?.avatar?.split('/avatars/')[1] ?? null

      await updateUser(data, previews, user?.id as string, path)
      resetVariable()
    })
  }

  const isOpen = open && mode === 'edit' && !!user

  return (
    <Dialog open={isOpen} onOpenChange={() => toggleOpen?.(false, null, null)}>
      <DialogContent className='sm:max-w-[40rem] sm:max-h-[90vh] overflow-auto custom-scrollbar'>
        <DialogHeader>
          <DialogTitle>Edit User — {user?.email}</DialogTitle>
        </DialogHeader>

        <div className='grid grid-cols-2 gap-2'>
          <Input
            title='Name'
            hasError={!!errors.name}
            errorMessage={errors.name?.message}
            {...register('name', {
              required: 'Field required.'
            })}
          />
          <Input
            title='Phone'
            hasError={!!errors.phone}
            errorMessage={errors.phone?.message}
            {...register('phone', {
              required: 'Field required.'
            })}
          />
        </div>

        <Textarea
          title='Address'
          hasError={!!errors.address}
          errorMessage={errors.address?.message}
          {...register('address', {
            required: 'Field required.'
          })}
        />

        <div className='space-y-2'>
          <Label className='text-sm font-medium mb-1.5'>Gender</Label>
          <Controller
            control={control}
            name='gender'
            render={({ field: { onChange, value } }) => (
              <Select onValueChange={(e) => onChange(e)} value={value}>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select gender' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='male'>Male</SelectItem>
                  <SelectItem value='female'>Female</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div>
          <ImageUpload
            pendingFiles={previews as File[]}
            title='Avatar'
            isLoading={isPending}
            setPendingFiles={setPreviews}
            acceptedImageCount={1}
          />
          {!!errors.avatar && (
            <Label className='text-red-500'>{errors.avatar?.message}</Label>
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

          <CustomButton
            type='button'
            onClick={handleSubmit(onSubmit)}
            disabled={isPending}
            isLoading={isPending}
          >
            Update
          </CustomButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
