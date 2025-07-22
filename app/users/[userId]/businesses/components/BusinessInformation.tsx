import { JSX, useState, useTransition, useEffect } from 'react'
import { linkRegex, regularEmailRegex } from '@/helpers/reusableRegex'
import { useForm, Controller } from 'react-hook-form'

import { CustomButton } from '@/components/custom/CustomButton'
import { Input } from '@/components/ui/input'
import { ImageUpload } from '@/components/custom/ImageUpload'
import { Textarea } from '@/components/ui/textarea'
import { BusinesInformation } from '@/service/business'
import { useBusinessDetails } from '@/service/business'

export function BusinessInformation(): JSX.Element {
  const [mount, setMount] = useState<boolean>(true)
  const [isPending, startTransition] = useTransition()

  const state = useBusinessDetails()

  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
    clearErrors,
    control
  } = useForm<BusinesInformation>()

  const onSubmit = (data: BusinesInformation): void => {
    startTransition(() => {
      state?.setBusinessInfo?.(data)
      clearErrors()
    })
  }

  useEffect(() => {
    const updateState = (): void => {
      if (state.businessInformation) {
        reset({
          ...state.businessInformation
        })
        setMount(false)
      }
    }

    if (mount) {
      updateState()
    }
  }, [state, mount, reset])

  return (
    <div className='space-y-2'>
      <div className='grid grid-cols-2 gap-2'>
        <Input
          type='text'
          title='Business Name'
          hasError={!!errors.name}
          errorMessage={errors.name?.message}
          {...register('name', {
            required: 'Required field.'
          })}
        />
        <Input
          type='email'
          title='Business Email'
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

      <div className='grid grid-cols-2 gap-2'>
        <Input
          title='Business Phone'
          hasError={!!errors.phone}
          errorMessage={errors.phone?.message}
          {...register('phone', {
            required: 'Required field.'
          })}
        />
        <Input
          type='link'
          title='Website Link'
          hasError={!!errors.website}
          errorMessage={errors.website?.message}
          {...register('website', {
            required: 'Required field.',
            pattern: {
              value: linkRegex,
              message: 'invalid link'
            }
          })}
        />
      </div>

      <div className='grid grid-cols-2 gap-2'>
        <Input
          title='Region'
          hasError={!!errors.region}
          errorMessage={errors.region?.message}
          {...register('region', {
            required: 'Required field.'
          })}
        />
        <Input
          type='link'
          title='Social Media Link'
          {...register('social_media', {
            required: 'Required field.',
            pattern: {
              value: linkRegex,
              message: 'invalid email address'
            }
          })}
        />
      </div>

      <Controller
        name='image'
        control={control}
        render={({ field: { onChange, value } }) => (
          <ImageUpload
            title='Image photo'
            pendingFiles={value as File[]}
            isLoading={isPending}
            acceptedImageCount={1}
            setPendingFiles={(value) => onChange(value)}
          />
        )}
      />
      <Textarea
        title='Address'
        hasError={!!errors.address}
        errorMessage={errors.address?.message}
        {...register('address', {
          required: 'Required field.'
        })}
      />

      <div className='grid grid-cols-2 gap-2'>
        <Input
          title='Phone'
          hasError={!!errors.phone}
          errorMessage={errors.phone?.message}
          {...register('phone', {
            required: 'Required field.'
          })}
        />

        <Input
          title='ABN/ACN'
          hasError={!!errors.abn_acn}
          errorMessage={errors.abn_acn?.message}
          {...register('abn_acn', {
            required: 'Required field.'
          })}
        />
      </div>

      <div className='flex items-center justify-end gap-2'>
        <CustomButton
          type='button'
          onClick={handleSubmit(onSubmit)}
          isLoading={isPending}
        >
          Next
        </CustomButton>
      </div>
    </div>
  )
}
