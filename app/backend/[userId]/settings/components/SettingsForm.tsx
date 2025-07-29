'use client'

import { useState, useTransition } from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Controller, useForm } from 'react-hook-form'
import { ImageUpload } from '@/components/custom/ImageUpload'
import { PencilIcon } from 'lucide-react'
import { CustomButton } from '@/components/custom/CustomButton'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { SettingsForm as SettingsFormType } from '@/supabase/db/auth'
import { avatarName } from '@/helpers/avatarName'
import { updateUser } from '@/supabase/db/authClient'

interface SettingsForm extends SettingsFormType {
  userId: string
}

export function SettingsForm({ userId, ...data }: SettingsForm) {
  const [previews, setPreviews] = useState<File[]>([])
  const [isPending, startTransition] = useTransition()

  const router = useRouter()

  const {
    control,
    register,
    formState: { errors },
    handleSubmit,
    setError
  } = useForm<SettingsFormType>({
    defaultValues: {
      ...data
    }
  })

  const onSubmit = async (data: SettingsFormType): Promise<void> => {
    startTransition(async () => {
      if (previews.length <= 0 && !data.avatar) {
        setError('avatar', {
          message: 'This is required.'
        })
        return
      }

      const path = data?.avatar?.split('/avatars/')[1] ?? null

      await updateUser(data, previews, userId, path)

      router.refresh()
    })
  }

  return (
    <Card className='min-w-4xl mx-auto'>
      <CardHeader>
        <CardTitle className='text-2xl'>Profile Settings</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex items-center gap-2'>
          <Avatar className='h-20 w-20 rounded-full'>
            <AvatarImage
              className='object-cover'
              src={data.avatar}
              alt={data.name}
            />
            <AvatarFallback className='text-3xl rounded-lg fill-blue-500 bg-blue-400 text-white font-semibold'>
              {avatarName(data?.email)}
            </AvatarFallback>
          </Avatar>

          <div>
            <h1 className='font-bold'>{data.email}</h1>
            <h2>{data.name || 'EMPTY'}</h2>
          </div>
        </div>
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
          title='address'
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
                  <SelectValue placeholder='Issue Type' />
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
      </CardContent>
      <CardFooter className='flex items-center gap-2 justify-end'>
        <CustomButton
          type='button'
          isLoading={isPending}
          disabled={isPending}
          onClick={handleSubmit(onSubmit)}
        >
          <PencilIcon />
          Update
        </CustomButton>
      </CardFooter>
    </Card>
  )
}
