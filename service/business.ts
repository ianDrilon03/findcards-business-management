import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

type Steps = 'business-info' | 'personal-info'

export interface BusinesInformation {
  name: string
  address: string
  email: string
  phone: string
  website: string
  region: string
  abn_acn: string
  social_media: string
  image: File[] | null
}

export interface PersonalDetails {
  firstName: string
  lastName: string
  phone: string
  personalEmail: string
  category_id: string
}

export interface BusinessDetails {
  businessInformation: BusinesInformation | null
  personalDetails: PersonalDetails | null
  step: Steps
  open: boolean
  setBusinessInfo?: (businessInformation: BusinesInformation) => void
  setPersonalDetails?: (personalDetails: PersonalDetails) => void
  setPrevious?: () => void
  reset?: () => void
  toggleOpenDialog?: (isOpen: boolean) => void
}

const initialState: BusinessDetails = {
  businessInformation: {
    name: '',
    address: '',
    email: '',
    phone: '',
    website: '',
    region: '',
    abn_acn: '',
    social_media: '',
    image: null
  },
  personalDetails: {
    firstName: '',
    lastName: '',
    phone: '',
    personalEmail: '',
    category_id: ''
  },
  step: 'business-info',
  open: false
}

export const useBusinessDetails = create<BusinessDetails>()(
  persist(
    (set) => ({
      ...initialState,
      setBusinessInfo: (businessInformation: BusinesInformation) => {
        set({
          businessInformation,
          personalDetails: null,
          step: 'personal-info'
        })
      },
      setPersonalDetails: (personalDetails: PersonalDetails) => {
        set((state: BusinessDetails) => ({
          businessInformation: state.businessInformation,
          personalDetails: personalDetails
        }))
      },
      toggleOpenDialog: (isOpen: boolean) => {
        set((state) => ({
          ...state,
          open: isOpen
        }))
      },
      setPrevious: () => {
        set((state: BusinessDetails) => ({
          ...state,
          businessInformation: {
            ...(state?.businessInformation as BusinesInformation),
            image: null
          },
          step: 'business-info'
        }))
      },
      reset: () => {
        set(initialState)
      }
    }),
    {
      name: 'use-business-details',
      storage: createJSONStorage(() => sessionStorage)
    }
  )
)
