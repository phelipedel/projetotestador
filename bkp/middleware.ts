import { type NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  // Check if user is accessing protected routes
  const protectedPaths = ["/dashboard", "/pdv", "/financeiro", "/estoque", "/relatorios"]
  const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  if (isProtectedPath) {
    // In a real app, you would verify the Firebase token here
    // For now, we'll redirect to login if no session cookie exists
    const hasSession = request.cookies.has("firebase-session")

    if (!hasSession) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/pdv/:path*", "/financeiro/:path*", "/estoque/:path*", "/relatorios/:path*"],
}
