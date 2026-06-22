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
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CustomButton } from '@/components/custom/CustomButton'
import { useUserActionDialog } from '@/service/user-action-dialog'
import { useRouter } from 'next/navigation'
import { useShallow } from 'zustand/react/shallow'
import { toast } from 'sonner'

interface ResetPasswordForm {
  password: string
  confirmPassword: string
}

export function ResetPasswordDialog(): JSX.Element {
  const router = useRouter()
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
    handleSubmit,
    register,
    reset,
    setError,
    formState: { errors }
  } = useForm<ResetPasswordForm>()

  const resetVariable = (): void => {
    reset({
      password: '',
      confirmPassword: ''
    })
    router.refresh()
    toggleOpen?.(false, null, null)
  }

  const onSubmit = async (data: ResetPasswordForm): Promise<void> => {
    startTransition(async () => {
      const { password, confirmPassword } = data

      if (password !== confirmPassword) {
        setError('confirmPassword', {
          message: "password doesn't matched"
        })
        return
      }

      const res = await fetch('/api/resetPassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, password })
      })

      const response = await res.json()

      if (!res.ok) {
        toast.error('Error!', {
          description: response.error || 'Something went wrong'
        })
        return
      }

      toast('Successfully', {
        description: 'Successfully reset password.'
      })
      resetVariable()
    })
  }

  const isOpen = open && mode === 'reset' && !!user

  return (
    <Dialog open={isOpen} onOpenChange={() => toggleOpen?.(false, null, null)}>
      <DialogContent className='sm:max-w-[40rem]'>
        <DialogHeader>
          <DialogTitle>Reset Password — {user?.email}</DialogTitle>
        </DialogHeader>

        <div className='grid grid-cols-2 gap-2'>
          <Input
            title='New Password'
            type='password'
            {...register('password', {
              required: 'Field is required.',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters.'
              }
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
            Reset Password
          </CustomButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
