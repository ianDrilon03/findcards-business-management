import { persist } from 'zustand/middleware'
import { createJSONStorage } from 'zustand/middleware'
import { create } from 'zustand'

type AlertType = 'verified' | 'remove-business' | null

export interface AlertDialog {
  open: boolean
  type: AlertType
  toggleOpenDialog?: (isOpen: boolean, type: AlertType) => void
}

const initialState: AlertDialog = {
  open: false,
  type: null
}

export const useAlertDialog = create<AlertDialog>()(
  persist(
    (set) => ({
      ...initialState,
      toggleOpenDialog: (isOpen: boolean, type: AlertType) => {
        set((state) => ({
          ...state,
          open: isOpen,
          type
        }))
      }
    }),
    {
      name: 'use-alert-dialog',
      storage: createJSONStorage(() => sessionStorage)
    }
  )
)
