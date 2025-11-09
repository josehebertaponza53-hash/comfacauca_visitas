import { type NextRequest, NextResponse } from "next/server"
import { obtenerUsuarioPorEmail } from "@/lib/db"
import { generarOTP } from "@/lib/auth"
import { guardarOTP } from "@/lib/otp-store"
import { enviarOTP } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ success: false, error: "Email es requerido" }, { status: 400 })
    }

    // Verificar si el usuario existe
    const usuario = await obtenerUsuarioPorEmail(email)

    if (!usuario) {
      return NextResponse.json({ success: false, error: "Usuario no encontrado" }, { status: 404 })
    }

    // Generar y guardar OTP
    const otp = generarOTP()
    guardarOTP(email, otp)

    // Enviar OTP por correo
    const enviado = await enviarOTP(email, otp)

    if (!enviado) {
      return NextResponse.json({ success: false, error: "Error al enviar el código" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Código enviado exitosamente",
    })
  } catch (error) {
    console.error("Error al enviar OTP:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
