import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  const isPublic = pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/verify-email') ||
    pathname === '/'

  const isOnboarding = pathname.startsWith('/onboarding')
  const isAdmin = pathname.startsWith('/admin')
  const isApp = !isPublic && !isOnboarding && !isAdmin

  // Not logged in → redirect to login (except public routes)
  if (!user && (isApp || isAdmin || isOnboarding)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Logged in on public auth pages → redirect to app
  if (user && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  if (user && isApp) {
    // Check if profile is complete
    const { data: profile } = await supabase
      .from('users')
      .select('profile_complete, onboarding_step')
      .eq('id', user.id)
      .single()

    if (!profile?.profile_complete) {
      const step = profile?.onboarding_step ?? 'BasicInfo'
      const stepRoutes: Record<string, string> = {
        BasicInfo: '/onboarding/basic-info',
        MobileOtpVerification: '/onboarding/phone-verify',
        VideoVerification: '/onboarding/selfie-verify',
      }
      const dest = stepRoutes[step] ?? '/onboarding/basic-info'
      if (!pathname.startsWith('/onboarding')) {
        return NextResponse.redirect(new URL(dest, request.url))
      }
    }
  }

  if (user && isAdmin) {
    const { data: adminRow } = await supabase
      .from('admin_users')
      .select('role, is_active')
      .eq('user_id', user.id)
      .single()

    if (!adminRow || !adminRow.is_active) {
      return NextResponse.redirect(new URL('/home', request.url))
    }

    // Team page only for super_admin
    if (pathname === '/admin/team' && adminRow.role !== 'super_admin') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
