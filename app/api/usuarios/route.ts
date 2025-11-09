import { type NextRequest, NextResponse } from "next/server"
import { obtenerUsuarios } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const userRole = request.headers.get("x-user-role")

    // Solo el jefe puede ver todos los usuarios, pero permitir obtener asesores para crear visitas
    const { searchParams } = new URL(request.url)
    const rol = searchParams.get("rol") as "JEFE" | "ASESOR" | null

    if (rol === "ASESOR") {
      // Permitir obtener asesores sin verificar rol del usuario
      const usuarios = await obtenerUsuarios(rol)
      return NextResponse.json({
        success: true,
        data: usuarios,
      })
    }

    // Para otros casos, verificar autorización
    if (userRole !== "JEFE") {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 })
    }

    const usuarios = await obtenerUsuarios(rol || undefined)

    return NextResponse.json({
      success: true,
      data: usuarios,
    })
  } catch (error) {
    console.error("Error al obtener usuarios:", error)
    return NextResponse.json({ success: false, error: "Error al obtener usuarios" }, { status: 500 })
  }
}
