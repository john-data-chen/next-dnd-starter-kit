import { getSessionCookie } from "better-auth/cookies"
import createMiddleware from "next-intl/middleware"
import { NextRequest, NextResponse } from "next/server"

import { ROUTES } from "@/constants/routes"
import { routing } from "@/i18n/routing"

// Create the i18n middleware
const intlMiddleware = createMiddleware(routing)

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow auth API routes to pass through
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next()
  }

  // Check for session cookie (lightweight check, no database call)
  const sessionCookie = getSessionCookie(req)
  const isAuthenticated = !!sessionCookie

  // Protect API routes
  if (pathname.startsWith("/api")) {
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.next()
  }

  // Apply i18n middleware
  const i18nResponse = intlMiddleware(req)

  // Extract locale from URL or use default
  const localeMatch = pathname.match(/^\/([a-z]{2})(?:\/|$)/)
  const locale = localeMatch ? localeMatch[1] : "en"
  const pathnameWithoutLocale = localeMatch ? pathname.slice(3) || "/" : pathname

  const isAuthRoute = pathnameWithoutLocale === ROUTES.AUTH.LOGIN

  const getRedirectUrl = (path: string) => {
    return new URL(`/${locale}${path}`, req.url)
  }

  // Redirect authenticated users away from login page
  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(getRedirectUrl(ROUTES.BOARDS.ROOT))
  }

  // Redirect unauthenticated users to login page
  if (!isAuthenticated && !isAuthRoute) {
    return NextResponse.redirect(getRedirectUrl(ROUTES.AUTH.LOGIN))
  }

  return i18nResponse || NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
}
