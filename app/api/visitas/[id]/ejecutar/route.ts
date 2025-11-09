import { type NextRequest, NextResponse } from "next/server"
import { actualizarVisita, registrarTrazabilidad } from "@/lib/db"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = Number.parseInt(request.headers.get("x-user-id") || "0")
    const userRole = request.headers.get("x-user-role")

    // Solo el asesor puede ejecutar
    if (userRole !== "ASESOR") {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 })
    }

    const visitaId = Number.parseInt(params.id)
    const { observaciones, estado } = await request.json()

    if (!estado || !["EN_EJECUCION", "EJECUTADA"].includes(estado)) {
      return NextResponse.json({ success: false, error: "Estado inválido" }, { status: 400 })
    }

    // Actualizar la visita
    await actualizarVisita(visitaId, {
      estado,
      observaciones,
    })

    // Registrar trazabilidad
    await registrarTrazabilidad({
      visita_id: visitaId,
      usuario_id: userId,
      accion: "EJECUTAR",
      detalles: observaciones || `Visita marcada como ${estado}`,
    })

    return NextResponse.json({
      success: true,
      message: `Visita ${estado === "EN_EJECUCION" ? "en ejecución" : "ejecutada"} exitosamente`,
    })
  } catch (error) {
    console.error("Error al ejecutar visita:", error)
    return NextResponse.json({ success: false, error: "Error al ejecutar visita" }, { status: 500 })
  }
}
