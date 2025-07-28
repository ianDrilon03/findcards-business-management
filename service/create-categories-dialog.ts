import { persist } from 'zustand/middleware'
import { createJSONStorage } from 'zustand/middleware'
import { create } from 'zustand'

type CategoryData = {
  id: string
  name: string | null
}

export interface CreateAlertDialog {
  open: boolean
  data: CategoryData | null
  toggleOpenDialog?: (isOpen: boolean, data: CategoryData | null) => void
}

const initialState: CreateAlertDialog = {
  open: false,
  data: null
}

export const useCreateCategoryDialog = create<CreateAlertDialog>()(
  persist(
    (set) => ({
      ...initialState,
      toggleOpenDialog: (isOpen: boolean, data: CategoryData | null) => {
        set((state) => ({
          ...state,
          open: isOpen,
          data
        }))
      }
    }),
    {
      name: 'category-alert-dialog',
      storage: createJSONStorage(() => sessionStorage)
    }
  )
)
