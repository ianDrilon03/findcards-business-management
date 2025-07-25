import { persist } from 'zustand/middleware'
import { createJSONStorage } from 'zustand/middleware'
import { create } from 'zustand'

export interface CreateAlertDialog {
  open: boolean
  toggleOpenDialog?: (isOpen: boolean) => void
}

const initialState: CreateAlertDialog = {
  open: false
}

export const useCreateUserDialog = create<CreateAlertDialog>()(
  persist(
    (set) => ({
      ...initialState,
      toggleOpenDialog: (isOpen: boolean) => {
        set((state) => ({
          ...state,
          open: isOpen
        }))
      }
    }),
    {
      name: 'use-alert-dialog',
      storage: createJSONStorage(() => sessionStorage)
    }
  )
)
