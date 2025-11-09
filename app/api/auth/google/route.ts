import { type NextRequest, NextResponse } from "next/server"
import { obtenerUsuarioPorEmail } from "@/lib/db"
import { generarOTP } from "@/lib/auth"
import { guardarOTP } from "@/lib/otp-store"
import { enviarOTP } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { email, nombre } = await request.json()

    if (!email || !nombre) {
      return NextResponse.json({ success: false, error: "Email y nombre son requeridos" }, { status: 400 })
    }

    // Verificar si el usuario existe
    const usuario = await obtenerUsuarioPorEmail(email)

    if (!usuario) {
      return NextResponse.json(
        { success: false, error: "Usuario no autorizado. Contacte al administrador." },
        { status: 403 },
      )
    }

    // Generar y guardar OTP
    const otp = generarOTP()
    guardarOTP(email, otp)

    // Enviar OTP por correo (a dirección específica para pruebas)
    const enviado = await enviarOTP("josehebertaponza22@gmail.com", otp)

    if (!enviado) {
      return NextResponse.json({ success: false, error: "Error al enviar el código de verificación" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Código de verificación enviado a tu correo",
      data: { email, requiresOTP: true },
    })
  } catch (error) {
    console.error("Error en autenticación Google:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
