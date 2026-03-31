import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const signupCookie = request.cookies.get('signup_success')
  const { pathname } = request.nextUrl

  // 🔒 Restrict signup success page to those with signup cookie
  if (pathname === '/signup-success') {
    if (!signupCookie) {
      return NextResponse.redirect(new URL('/auth', request.url))
    }
    return NextResponse.next()
  }

  if (pathname.startsWith('/admin') || pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  const authPages = [
    '/sign-in',
    '/sign-up',
    '/forgotten-password',
    '/reset-password',
    '/email-sent',
    '/signup-successful',
  ]

  if (token && authPages.includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next|api|static|favicon.ico).*)', // Match all paths except assets
  ],
}
