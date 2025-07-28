import { persist } from 'zustand/middleware'
import { createJSONStorage } from 'zustand/middleware'
import { PrizesType } from '@/lib/types/prizes'
import { create } from 'zustand'

type PrizesDialog = {
  id: string
  name: string | null
  status: PrizesType
  creditCost: number
}

export interface CreateAlertDialog {
  open: boolean
  data: PrizesDialog | null
  toggleOpenDialog?: (isOpen: boolean, data: PrizesDialog | null) => void
}

const initialState: CreateAlertDialog = {
  open: false,
  data: null
}

export const useCreatePrizesDialog = create<CreateAlertDialog>()(
  persist(
    (set) => ({
      ...initialState,
      toggleOpenDialog: (isOpen: boolean, data: PrizesDialog | null) => {
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
