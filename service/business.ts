import { create } from 'zustand'
import { persist, devtools, createJSONStorage } from 'zustand/middleware'

type Steps = 'business-info' | 'personal-info'

export interface BusinesInformation {
  name: string
  address: string
  email: string
  phone: string
  website: string
  region: string
  abn_acn: string
  socialMedia: string
  image: File[] | null
}

export interface PersonalDetails {
  firstName: string
  lastName: string
  phone: string
  email: string
}

interface BusinessDetails {
  businessInformation: BusinesInformation | null
  personalDetails: PersonalDetails | null
  step: Steps
  setBusinessInfo?: (businessInformation: BusinesInformation) => void
  setPersonalDetails?: (personalDetails: PersonalDetails) => void
  setPrevious?: () => void
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
    socialMedia: '',
    image: null
  },
  personalDetails: {
    firstName: '',
    lastName: '',
    phone: '',
    email: ''
  },
  step: 'business-info'
}

export const useBusinessDetails = create<BusinessDetails>()(
  devtools(
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
        setPrevious: () => {
          set((state: BusinessDetails) => ({
            ...state,
            businessInformation: {
              ...(state?.businessInformation as BusinesInformation),
              image: null
            },
            step: 'business-info'
          }))
        }
      }),
      {
        name: 'use-business-details',
        storage: createJSONStorage(() => sessionStorage)
      }
    )
  )
)
