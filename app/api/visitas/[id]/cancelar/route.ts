import { type NextRequest, NextResponse } from "next/server"
import { actualizarVisita, registrarTrazabilidad } from "@/lib/db"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = Number.parseInt(request.headers.get("x-user-id") || "0")
    const visitaId = Number.parseInt(params.id)
    const { motivo_cancelacion_id, observaciones } = await request.json()

    if (!motivo_cancelacion_id) {
      return NextResponse.json({ success: false, error: "motivo_cancelacion_id es requerido" }, { status: 400 })
    }

    // Actualizar la visita
    await actualizarVisita(visitaId, {
      estado: "CANCELADA",
      motivo_cancelacion_id,
      modificado_por: userId,
    })

    // Registrar trazabilidad
    await registrarTrazabilidad({
      visita_id: visitaId,
      usuario_id: userId,
      accion: "CANCELAR",
      detalles: observaciones || "Visita cancelada",
    })

    return NextResponse.json({
      success: true,
      message: "Visita cancelada exitosamente",
    })
  } catch (error) {
    console.error("Error al cancelar visita:", error)
    return NextResponse.json({ success: false, error: "Error al cancelar visita" }, { status: 500 })
  }
}
