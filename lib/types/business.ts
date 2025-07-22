import { CategoryDB } from './category'
import { User } from './user'

export interface BusinessDB {
  id: string
  name: string
  address: string
  phone: string
  status: 'verified' | 'unverified'
  email: string
  website: string
  region: string
  abn_acn: string
  social_media: string
  image: string
  archive_at: string
  updated_at: string
  created_at: string
}

export interface BusinessDetailsDB {
  id: string
  businesses: BusinessDB
  referred_by: User
  category: CategoryDB
  phone: string
  first_name: string
  last_name: string
  personal_email: string
}
