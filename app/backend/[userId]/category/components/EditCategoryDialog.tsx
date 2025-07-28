'use client'

import { JSX, useTransition, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog'
import { editCategory } from '@/supabase/db/category'
import { useCreateCategoryDialog } from '@/service/create-categories-dialog'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CustomButton } from '@/components/custom/CustomButton'
import { useRouter } from 'next/navigation'
import { useShallow } from 'zustand/react/shallow'

export function EditCategoryDialog(): JSX.Element {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const {
    open,
    toggleOpen,
    data: categoryData
  } = useCreateCategoryDialog(
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
    formState: { errors }
  } = useForm<{ name: string }>()

  const resetVariable = (): void => {
    reset({
      name: ''
    })
    router.refresh()
    toggleOpen?.(false, null)
  }

  const onSubmit = async (data: { name: string }): Promise<void> => {
    startTransition(async () => {
      const { name } = data

      await editCategory(name, categoryData?.id as string)
      resetVariable()
    })
  }

  useEffect(() => {
    if (!!categoryData) {
      reset({
        name: categoryData?.name as string
      })
    }
  }, [reset, categoryData])

  const isOpen = open && !!categoryData?.name

  return (
    <Dialog open={isOpen} onOpenChange={() => toggleOpen?.(false, null)}>
      <DialogContent className='sm:max-w-[40rem]'>
        <DialogHeader>
          <DialogTitle>Edit New Category</DialogTitle>
        </DialogHeader>
        <Input
          title='Category'
          {...register('name', {
            required: 'Field is required.'
          })}
          hasError={!!errors.name}
          errorMessage={errors.name?.message}
        />

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
              Update
            </CustomButton>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
