import { type NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  const protectedPaths = [
    "/dashboard",
    "/pdv",
    "/financeiro",
    "/produtos",
    "/clientes",
    "/fornecedores",
    "/compras",
    "/relatorios",
    "/configuracoes",
    "/mobile"
  ]

  const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  if (isProtectedPath) {
    const token = request.cookies.get("firebase-token")?.value

    if (!token) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("redirect", request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  if (request.nextUrl.pathname === "/login") {
    const token = request.cookies.get("firebase-token")?.value
    if (token) {
      const redirectParam = request.nextUrl.searchParams.get("redirect")
      const redirectUrl = redirectParam || "/dashboard"
      return NextResponse.redirect(new URL(redirectUrl, request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/pdv/:path*",
    "/financeiro/:path*",
    "/produtos/:path*",
    "/clientes/:path*",
    "/fornecedores/:path*",
    "/compras/:path*",
    "/relatorios/:path*",
    "/configuracoes/:path*",
    "/mobile/:path*",
    "/login",
  ],
}
