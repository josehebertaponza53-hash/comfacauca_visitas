import { type NextRequest, NextResponse } from "next/server"
import { obtenerVisitas, crearVisita, registrarTrazabilidad } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const userId = Number.parseInt(request.headers.get("x-user-id") || "0")
    const userRole = request.headers.get("x-user-role")

    const { searchParams } = new URL(request.url)
    const asesorId = searchParams.get("asesor_id")
    const fecha = searchParams.get("fecha")
    const estado = searchParams.get("estado")

    const filtros: any = {}

    // Si es asesor, solo ve sus propias visitas
    if (userRole === "ASESOR") {
      filtros.asesor_id = userId
    } else if (asesorId) {
      filtros.asesor_id = Number.parseInt(asesorId)
    }

    if (fecha) {
      filtros.fecha = fecha
    }

    if (estado) {
      filtros.estado = estado
    }

    const visitas = await obtenerVisitas(filtros)

    return NextResponse.json({
      success: true,
      data: visitas,
    })
  } catch (error) {
    console.error("Error al obtener visitas:", error)
    return NextResponse.json({ success: false, error: "Error al obtener visitas" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = Number.parseInt(request.headers.get("x-user-id") || "0")
    const userRole = request.headers.get("x-user-role")

    // Solo el jefe puede crear visitas
    if (userRole !== "JEFE") {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const { asesor_id, objetivo, tipo, fecha_programada } = body

    if (!asesor_id || !objetivo || !tipo || !fecha_programada) {
      return NextResponse.json({ success: false, error: "Faltan campos requeridos" }, { status: 400 })
    }

    // Crear la visita
    const visitaId = await crearVisita({
      asesor_id,
      objetivo,
      tipo,
      fecha_programada,
      programada_por_id: userId,
    })

    // Registrar trazabilidad
    await registrarTrazabilidad({
      visita_id: visitaId,
      usuario_id: userId,
      accion: "PROGRAMAR",
      detalles: `Visita programada para ${objetivo}`,
    })

    return NextResponse.json({
      success: true,
      message: "Visita creada exitosamente",
      data: { id: visitaId },
    })
  } catch (error) {
    console.error("Error al crear visita:", error)
    return NextResponse.json({ success: false, error: "Error al crear visita" }, { status: 500 })
  }
}
