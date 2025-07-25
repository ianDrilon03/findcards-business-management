import { JSX, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { BusinesInformation, useBusinessDetails } from '@/service/business'
import { regularEmailRegex } from '@/helpers/reusableRegex'
import { CustomButton } from '@/components/custom/CustomButton'
import { PersonalDetails } from '@/service/business'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AddBusinessInfo, addBusinessInfo } from '@/supabase/db/business'
import { useUser } from '@/context/AuthProvider'
import { User } from '@supabase/supabase-js'
import { Label } from '@/components/ui/label'
import { Controller } from 'react-hook-form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import { convertKeysToSnakeCase } from '@/helpers/camelToSnakeCase'
import { useCategory } from '@/lib/hook/useCategory'

export function PersonalInformation(): JSX.Element {
  const [isPending, startTransition] = useTransition()
  const { user } = useUser() as { user: User }

  const state = useBusinessDetails()
  const { category } = useCategory()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    control
  } = useForm<PersonalDetails>()

  const onSubmit = async (data: PersonalDetails): Promise<void> => {
    startTransition(async () => {
      const dataBusiness: AddBusinessInfo = {
        personalDetails: convertKeysToSnakeCase(data) as PersonalDetails,
        businessInformation: convertKeysToSnakeCase(
          state?.businessInformation
        ) as BusinesInformation
      }

      await addBusinessInfo(dataBusiness as AddBusinessInfo, user.id)
      state?.toggleOpenDialog?.(false)
      state?.reset?.()
      router.refresh()
    })
  }

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
          hasError={!!errors.personalEmail}
          errorMessage={errors.personalEmail?.message}
          {...register('personalEmail', {
            required: 'Required field.',
            pattern: {
              value: regularEmailRegex,
              message: 'invalid email address'
            }
          })}
        />
      </div>

      <div className='space-y-2'>
        <Label className='text-sm font-medium mb-1.5'>Business Category</Label>
        <Controller
          control={control}
          name='category_id'
          render={({ field: { onChange, value } }) => (
            <Select value={value} onValueChange={(e) => onChange(e)}>
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Select Category' />
              </SelectTrigger>
              <SelectContent>
                {category.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
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
