'use client'

import {
  createContext,
  ReactNode,
  useState,
  useEffect,
  useContext
} from 'react'
import { Spinner } from '@/components/custom/Spinner'
import { createClient } from '@/config/client'
import { User } from '@supabase/supabase-js'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

interface Users extends User {
  userRole: string
}

interface UserType {
  user: Users
}

interface AuthProviderType {
  children: ReactNode
}

export const AuthContext = createContext<UserType | null>(null)

export const AuthProvider = ({ children }: AuthProviderType) => {
  const [user, setUser] = useState<Users | null>(null)
  const [mount, setMount] = useState<boolean>(true)

  const supabase = createClient()
  const params = useSearchParams()
  const getParam = new URLSearchParams(params)
  const requiredForm = getParam.get('required-form')

  useEffect(() => {
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      setMount(true)
      setUser((session?.user as Users) ?? null)
    })

    return () => {
      subscription.unsubscribe
    }
  }, [supabase, setMount])

  useEffect(() => {
    const loadSession = async (): Promise<void> => {
      const {
        data: { session },
        error
      } = await supabase.auth.getSession()

      const { data, error: userError } = await supabase
        .from('users')
        .select('role, name, gender, address, phone')
        .eq('id', session?.user.id)
        .single()

      if (userError) {
        throw userError.message
      }

      if (error) {
        throw error.message
      }

      setUser({ ...session?.user, userRole: data.role } as Users)
      setMount(false)
    }

    if (mount) {
      loadSession()
    }

    if (Boolean(requiredForm)) {
      toast.info('Info', {
        description: "You're required to fill the missing info"
      })
    }
  }, [supabase, mount, setMount, requiredForm])

  if (!user?.userRole) {
    return (
      <div className='flex items-center justify-center h-[85vh]'>
        <Spinner />
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user: user as Users }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useUser must be used within a AuthProvider')
  }

  return context
}
