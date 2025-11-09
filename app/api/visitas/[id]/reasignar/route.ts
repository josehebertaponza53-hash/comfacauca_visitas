import { type NextRequest, NextResponse } from "next/server"
import { actualizarVisita, registrarTrazabilidad } from "@/lib/db"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = Number.parseInt(request.headers.get("x-user-id") || "0")
    const userRole = request.headers.get("x-user-role")

    // Solo el jefe puede reasignar
    if (userRole !== "JEFE") {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 })
    }

    const visitaId = Number.parseInt(params.id)
    const { nuevo_asesor_id, motivo } = await request.json()

    if (!nuevo_asesor_id) {
      return NextResponse.json({ success: false, error: "nuevo_asesor_id es requerido" }, { status: 400 })
    }

    // Actualizar la visita
    await actualizarVisita(visitaId, {
      asesor_id: nuevo_asesor_id,
      estado: "REASIGNADA",
      reasignada_por_id: userId,
    })

    // Registrar trazabilidad
    await registrarTrazabilidad({
      visita_id: visitaId,
      usuario_id: userId,
      accion: "REASIGNAR",
      detalles: motivo || `Visita reasignada a asesor ${nuevo_asesor_id}`,
    })

    return NextResponse.json({
      success: true,
      message: "Visita reasignada exitosamente",
    })
  } catch (error) {
    console.error("Error al reasignar visita:", error)
    return NextResponse.json({ success: false, error: "Error al reasignar visita" }, { status: 500 })
  }
}
