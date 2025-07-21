import { IdCard } from 'lucide-react'

export const appName = (email: string) => {
  return [
    {
      name: 'FC Businesses Management',
      logo: IdCard,
      plan: email
    }
  ]
}
