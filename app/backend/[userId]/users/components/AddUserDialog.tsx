'use client'

import { JSX, ReactNode, useTransition } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CustomButton } from '@/components/custom/CustomButton'
import { regularEmailRegex } from '@/helpers/reusableRegex'
import { registerUser, UserForm } from '@/supabase/db/authClient'
import { useRouter } from 'next/navigation'

interface AddUserDialog {
  children: ReactNode
}

export function AddUserDialog({ children }: AddUserDialog): JSX.Element {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
    setError
  } = useForm<UserForm>()

  const resetVariable = (): void => {
    reset()
    router.refresh()
  }

  const onSubmit = async (data: UserForm): Promise<void> => {
    startTransition(async () => {
      const { password, confirmPassword } = data
      if (password !== confirmPassword) {
        setError('confirmPassword', {
          message: "password doesn't matched"
        })
        return
      }

      await registerUser(data)
      resetVariable()
    })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
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
        <DialogFooter>
          <DialogClose asChild>
            <Button type='button' variant='outline'>
              Cancel
            </Button>
          </DialogClose>

          <DialogClose asChild>
            <CustomButton
              type='button'
              onClick={handleSubmit(onSubmit)}
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
