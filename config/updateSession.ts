import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request
  })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY'
    )
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          request.cookies.set(name, value)
        )
        supabaseResponse = NextResponse.next({
          request
        })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      }
    }
  })

  const { pathname } = request.nextUrl

  const {
    data: { user }
  } = await supabase.auth.getUser()

  const baseAdminURL = `/backend/${user?.id}`

  const protectedAdminRoutes = ['dashboard', 'businesses']

  const isProtected = protectedAdminRoutes.some((route) =>
    pathname.endsWith(route)
  )

  if (!user && isProtected) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  if (user && pathname === '/auth/login') {
    return NextResponse.redirect(
      new URL(`${baseAdminURL}/dashboard`, request.url)
    )
  }

  return supabaseResponse
}
