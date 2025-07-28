import { User } from './user'

export type PrizesType = 'published' | 'draft'

export interface PrizesDB {
  id: string
  name: string
  credit_cost: string
  status: PrizesType
  image: File[] | string
  claimed_by: User
  created_at: string
  updated_at: string
  archived_at: string
}

export type PrizesForm = Pick<
  PrizesDB,
  'name' | 'status' | 'credit_cost' | 'image'
>
export type PrizesTable = Omit<PrizesDB, 'archived_at'>
