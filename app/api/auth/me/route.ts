import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    const userRole = request.headers.get("x-user-role")
    const userEmail = request.headers.get("x-user-email")

    if (!userId || !userRole || !userEmail) {
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      data: {
        id: Number.parseInt(userId),
        email: userEmail,
        rol: userRole,
      },
    })
  } catch (error) {
    console.error("Error al obtener usuario:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
