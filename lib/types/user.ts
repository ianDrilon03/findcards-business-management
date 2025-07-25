export interface User {
  id?: string
  name: string
  address: string
  gender: 'male' | 'female'
  phone: string
  avatar: string
  email: string
  password?: string
  confirmPassword?: string
  role: string
}

export type UserCredits = {
  credits: number
  users: User
}

export type UserType = Pick<User, 'id' | 'email' | 'avatar'>
