import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define public routes that don't require authentication
const publicRoutes = ['/', '/auth/login', '/auth/register']

// Define protected routes that require authentication
const protectedRoutes = ['/dashboard']

export function middleware(request: NextRequest) {
  // Get the pathname from the URL
  const path = request.nextUrl.pathname

  // Get the token from cookies - adjust the cookie name as per your auth implementation
  const isAuthenticated = !!request.cookies.get('token')

  // Function to check if the current path starts with any protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    path.startsWith(route)
  )

  // Function to check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => 
    path === route
  )

  // If user is not authenticated and tries to access protected route
  if (!isAuthenticated && isProtectedRoute) {
    const url = new URL('/auth/login', request.url)
    // Add the original URL as a redirect parameter
    url.searchParams.set('redirect', path)
    return NextResponse.redirect(url)
  }

  // If user is authenticated and tries to access public routes
  if (isAuthenticated && isPublicRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Allow the request to continue
  return NextResponse.next()
}

// Configure which routes should be handled by this middleware
export const config = {
  matcher: [
    /*
     * Match all routes except:
     * 1. /api (API routes)
     * 2. /_next (Next.js internals)
     * 3. /_static (static files)
     * 4. /_vercel (Vercel internals)
     * 5. /favicon.ico, /sitemap.xml (static files)
     */
    '/((?!api|_next|_static|_vercel|favicon.ico|sitemap.xml).*)',
  ],
}