'use client'

import { useState, useTransition } from 'react'
import { cn } from '@/lib/utils'
import { CustomButton } from '@/components/custom/CustomButton'
import { useForm, FormProvider } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { regularEmailRegex } from '@/helpers/reusableRegex'
import { useRouter } from 'next/navigation'
import { User } from '@/lib/types/user'
import { createClient } from '@/config/client'
import { Ban } from 'lucide-react'

import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const [message, setMessage] = useState<string>('')
  const [isPending, startTransition] = useTransition()
  const form = useForm<User>()
  const {
    register,
    formState: { errors },
    handleSubmit
  } = form

  const supabase = createClient()
  const router = useRouter()

  const onSubmit = async ({
    email,
    password
  }: Pick<User, 'email' | 'password'>): Promise<void> => {
    startTransition(async () => {
      const { error, data } = await supabase.auth.signInWithPassword({
        email: email,
        password: password as string
      })

      const userId = data.user?.id

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role, name, gender, address, phone')
        .eq('id', userId)
        .single()

      if (userError) {
        await supabase.auth.signOut()
        throw userError.message
      }

      if (error || !data.session) {
        setMessage(error?.message as string)
      }

      // const userDatas = {
      //   name: userData?.name,
      //   gender: userData?.gender,
      //   address: userData?.address,
      //   phone: userData?.phone
      // }

      // if (
      //   userData?.role === 'user' &&
      //   Object.values(userDatas).some((item) => item === null)
      // ) {
      //   router.push(`/users/${userId}/settings?required-form=true`)
      //
      //   return
      // }

      if (userData?.role === 'user') {
        router.push(`/users/${userId}/businesses`)

        return
      }

      router.push(`/backend/${userId}/businesses`)
    })
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className={cn('flex flex-col gap-6', className)} {...props}>
          <div className='flex flex-col items-center gap-2 text-center'>
            <h1 className='text-2xl font-bold' aria-label='login-title'>
              Login to your account
            </h1>
            <p
              className='text-balance text-sm text-muted-foreground'
              aria-label='login-desc'
            >
              Enter your email below to login to your account
            </p>
          </div>

          {message && (
            <Alert className='border-red-500 bg-red-500/20'>
              <Ban className='h-4 w-4' />
              <AlertTitle>Note!</AlertTitle>
              <AlertDescription>
                {message === 'Unauthorized'
                  ? 'This account is not registered'
                  : message}
              </AlertDescription>
            </Alert>
          )}

          <div className='grid gap-6'>
            <Input
              id='email'
              title='Email'
              type='email'
              placeholder='example@email.com'
              {...register('email', {
                required: 'field required.',
                pattern: {
                  value: regularEmailRegex,
                  message: 'invalid email address'
                }
              })}
              hasError={!!errors.email}
              errorMessage={errors.email?.message as string}
            />
            <div className='grid gap-2'>
              <Input
                title='Password'
                id='password'
                type='password'
                placeholder='Password'
                hasError={!!errors.password as boolean}
                errorMessage={errors.password?.message as string}
                {...register('password', {
                  required: 'field required.'
                })}
              />
            </div>
            <CustomButton
              isLoading={isPending}
              type='submit'
              className='w-full cursor-pointer'
            >
              Login
            </CustomButton>
          </div>
        </div>
      </form>
    </FormProvider>
  )
}
