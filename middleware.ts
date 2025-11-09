import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verificarToken } from "./lib/auth"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rutas públicas
  const rutasPublicas = ["/login", "/api/auth/google", "/api/auth/send-otp", "/api/auth/verify-otp", "/api/usuarios"]
  if (rutasPublicas.some((ruta) => pathname.startsWith(ruta))) {
    return NextResponse.next()
  }

  // Verificar token
  const token = request.cookies.get("auth_token")?.value

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const payload = await verificarToken(token)
  if (!payload) {
    const response = NextResponse.redirect(new URL("/login", request.url))
    response.cookies.delete("auth_token")
    return response
  }

  // Agregar información del usuario al header
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-user-id", payload.userId.toString())
  requestHeaders.set("x-user-role", payload.rol)
  requestHeaders.set("x-user-email", payload.email)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon|apple-icon).*)"],
}
