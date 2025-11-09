import { type NextRequest, NextResponse } from "next/server"
import { obtenerUsuarioPorEmail } from "@/lib/db"
import { crearToken } from "@/lib/auth"
import { verificarOTP } from "@/lib/otp-store"

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json({ success: false, error: "Email y código son requeridos" }, { status: 400 })
    }

    // Verificar el OTP
    const valido = verificarOTP(email, code)

    if (!valido) {
      return NextResponse.json({ success: false, error: "Código inválido o expirado" }, { status: 401 })
    }

    // Obtener usuario
    const usuario = await obtenerUsuarioPorEmail(email)

    if (!usuario) {
      return NextResponse.json({ success: false, error: "Usuario no encontrado" }, { status: 404 })
    }

    // Crear token JWT
    const token = await crearToken({
      userId: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      area: usuario.area,
    })

    // Configurar cookie
    const response = NextResponse.json({
      success: true,
      message: "Autenticación exitosa",
      data: {
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol,
          area: usuario.area,
        },
      },
    })

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 8, // 8 horas
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Error al verificar OTP:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
