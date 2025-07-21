import { JSX, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { useBusinessDetails } from '@/service/business'
import { regularEmailRegex } from '@/helpers/reusableRegex'
import { CustomButton } from '@/components/custom/CustomButton'
import { PersonalDetails } from '@/service/business'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export const PersonalInformation = (): JSX.Element => {
  const [isPending, startTransition] = useTransition()

  const state = useBusinessDetails()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<PersonalDetails>()

  const onSubmit = (data: PersonalDetails): void => {}

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-2 gap-2'>
        <Input
          type='text'
          title='First Name'
          hasError={!!errors.firstName}
          errorMessage={errors.firstName?.message}
          {...register('firstName', {
            required: 'Required field.'
          })}
        />
        <Input
          type='text'
          title='Last Name'
          hasError={!!errors.lastName}
          errorMessage={errors.lastName?.message}
          {...register('lastName', {
            required: 'Required field.'
          })}
        />
      </div>

      <div className='grid grid-cols-2 gap-2'>
        <Input
          type='text'
          title='Phone'
          hasError={!!errors.phone}
          errorMessage={errors.phone?.message}
          {...register('phone', {
            required: 'Required field.'
          })}
        />
        <Input
          type='email'
          title='Email Address'
          hasError={!!errors.email}
          errorMessage={errors.email?.message}
          {...register('email', {
            required: 'Required field.',
            pattern: {
              value: regularEmailRegex,
              message: 'invalid email address'
            }
          })}
        />
      </div>

      <div className='flex items-center justify-end gap-2'>
        <Button
          type='button'
          variant='outline'
          onClick={() => state.setPrevious?.()}
        >
          previous
        </Button>

        <CustomButton
          type='button'
          onClick={handleSubmit(onSubmit)}
          isLoading={isPending}
        >
          Submit
        </CustomButton>
      </div>
    </div>
  )
}
