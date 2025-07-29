'use client'

import { JSX, useState, useTransition } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog'
import { useCreateUserDialog } from '@/service/create-user-dialog'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CustomButton } from '@/components/custom/CustomButton'
import { regularEmailRegex } from '@/helpers/reusableRegex'
import { UserForm } from '@/supabase/db/authClient'
import { useRouter } from 'next/navigation'
import { useShallow } from 'zustand/react/shallow'

export function AddUserDialog(): JSX.Element {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<string>('')

  const { open, toggleOpen } = useCreateUserDialog(
    useShallow((state) => ({
      open: state.open,
      toggleOpen: state.toggleOpenDialog
    }))
  )

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
    setError
  } = useForm<UserForm>()

  const resetVariable = (): void => {
    reset({
      email: '',
      password: '',
      confirmPassword: ''
    })
    router.refresh()
    toggleOpen?.(false)
  }

  const onSubmit = async (data: UserForm): Promise<void> => {
    const { email } = data
    startTransition(async () => {
      const { password, confirmPassword } = data
      if (password !== confirmPassword) {
        setError('confirmPassword', {
          message: "password doesn't matched"
        })
        return
      }

      const res = await fetch('/api/signUp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const response = await res.json()

      setMessage(response.error)
      resetVariable()
    })
  }

  return (
    <Dialog open={open} onOpenChange={() => toggleOpen?.(false)}>
      <DialogContent className='sm:max-w-[40rem]'>
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
        </DialogHeader>
        <Input
          title='Email'
          {...register('email', {
            required: 'Field is required.',

            pattern: {
              value: regularEmailRegex,
              message: 'invalid email address'
            }
          })}
          hasError={!!errors.email}
          errorMessage={errors.email?.message}
        />
        <div className='grid grid-cols-2 gap-2'>
          <Input
            title='Password'
            type='password'
            {...register('password', {
              required: 'Field is required.'
            })}
            hasError={!!errors.password}
            errorMessage={errors.password?.message}
          />
          <Input
            title='Confirm Password'
            type='password'
            {...register('confirmPassword', {
              required: 'Field is required.'
            })}
            hasError={!!errors.confirmPassword}
            errorMessage={errors.confirmPassword?.message}
          />
        </div>

        {!!message && <p className='text-sm text-red-500'>{message}</p>}
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
