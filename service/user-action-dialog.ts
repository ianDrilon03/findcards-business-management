import { persist, createJSONStorage } from 'zustand/middleware'
import { create } from 'zustand'
import { User } from '@/lib/types/user'

export type UserActionMode = 'edit' | 'reset' | 'delete' | null

export type UserActionData = Omit<User, 'password' | 'confirmPassword'>

export interface UserActionDialog {
  open: boolean
  mode: UserActionMode
  user: UserActionData | null
  toggleOpenDialog?: (
    isOpen: boolean,
    mode: UserActionMode,
    user: UserActionData | null
  ) => void
}

const initialState: UserActionDialog = {
  open: false,
  mode: null,
  user: null
}

export const useUserActionDialog = create<UserActionDialog>()(
  persist(
    (set) => ({
      ...initialState,
      toggleOpenDialog: (
        isOpen: boolean,
        mode: UserActionMode,
        user: UserActionData | null
      ) => {
        set((state) => ({
          ...state,
          open: isOpen,
          mode,
          user
        }))
      }
    }),
    {
      name: 'user-action-dialog',
      storage: createJSONStorage(() => sessionStorage)
    }
  )
)
