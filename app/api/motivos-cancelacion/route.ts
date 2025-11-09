import { NextResponse } from "next/server"
import { obtenerMotivosCancelacion } from "@/lib/db"

export async function GET() {
  try {
    const motivos = await obtenerMotivosCancelacion()

    return NextResponse.json({
      success: true,
      data: motivos,
    })
  } catch (error) {
    console.error("Error al obtener motivos:", error)
    return NextResponse.json({ success: false, error: "Error al obtener motivos de cancelación" }, { status: 500 })
  }
}
