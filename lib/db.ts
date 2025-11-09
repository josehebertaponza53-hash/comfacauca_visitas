import mysql from "mysql2/promise"
import type { Usuario, Visita, MotivoCancelacion } from "./types"

// Singleton para la conexión a la base de datos
let connection: mysql.Connection | null = null

export async function getConnection(): Promise<mysql.Connection> {
  if (!connection) {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "root",
      database: process.env.DB_NAME || "comfacauca_visitas",
      port: Number.parseInt(process.env.DB_PORT || "3306"),
    })
  }
  return connection
}

// Funciones de acceso a datos
export async function obtenerUsuarioPorEmail(email: string): Promise<Usuario | null> {
  const conn = await getConnection()
  const [rows] = await conn.execute<any[]>("SELECT id, nombre, correo, rol, '' as area, fecha_creacion as created_at FROM usuario WHERE correo = ?", [email])
  return rows.length > 0 ? rows[0] : null
}

export async function crearUsuario(data: {
  nombre: string
  email: string
  rol: "JEFE" | "ASESOR"
  area: string
}): Promise<Usuario> {
  const conn = await getConnection()
  const [result] = await conn.execute<any>("INSERT INTO usuarios (nombre, correo, rol, area) VALUES (?, ?, ?, ?)", [
    data.nombre,
    data.email,
    data.rol,
    data.area,
  ])
  return {
    id: result.insertId,
    ...data,
    created_at: new Date().toISOString(),
  }
}

export async function obtenerVisitas(filtros?: {
  asesor_id?: number
  fecha?: string
  estado?: string
}): Promise<any[]> {
  const conn = await getConnection()
  let query = `
    SELECT v.id, v.id_asesor as asesor_id, v.fecha_programada, v.estado, v.creado_por as programada_por_id,
           u.nombre as asesor_nombre, '' as asesor_area,
           p.nombre as programada_por_nombre,
           mc.descripcion as motivo_cancelacion,
           o.nombre as objetivo, o.tipo_visita as tipo
    FROM visita v
    INNER JOIN usuario u ON v.id_asesor = u.id
    INNER JOIN usuario p ON v.creado_por = p.id
    LEFT JOIN motivo_cancelacion mc ON v.motivo_cancelacion_id = mc.id
    LEFT JOIN objetivo o ON v.id_objetivo = o.id
    WHERE 1=1
  `
  const params: any[] = []

  if (filtros?.asesor_id) {
    query += " AND v.id_asesor = ?"
    params.push(filtros.asesor_id)
  }

  if (filtros?.fecha) {
    query += " AND DATE(v.fecha_programada) = ?"
    params.push(filtros.fecha)
  }

  if (filtros?.estado) {
    query += " AND v.estado = ?"
    params.push(filtros.estado)
  }

  query += " ORDER BY v.fecha_programada DESC"

  const [rows] = await conn.execute<any[]>(query, params)
  return rows
}

export async function crearVisita(data: {
  asesor_id: number
  objetivo: string
  tipo: "EMPRESARIAL" | "INDIVIDUAL"
  fecha_programada: string
  programada_por_id: number
}): Promise<number> {
  const conn = await getConnection()

  // Primero crear el objetivo
  const [objetivoResult] = await conn.execute<any>(
    "INSERT INTO objetivo (nombre, tipo_visita) VALUES (?, ?)",
    [data.objetivo, data.tipo]
  )
  const objetivoId = objetivoResult.insertId

  // Luego crear la visita
  const [result] = await conn.execute<any>(
    "INSERT INTO visita (id_asesor, id_objetivo, fecha_programada, estado, creado_por) VALUES (?, ?, ?, ?, ?)",
    [data.asesor_id, objetivoId, data.fecha_programada, "PROGRAMADA", data.programada_por_id],
  )
  return result.insertId
}

export async function actualizarVisita(id: number, data: Partial<Visita>): Promise<void> {
  const conn = await getConnection()
  const sets: string[] = []
  const params: any[] = []

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      if (key === 'estado') sets.push(`estado = ?`)
      else if (key === 'motivo_cancelacion_id') sets.push(`motivo_cancelacion_id = ?`)
      else if (key === 'modificado_por') sets.push(`modificado_por = ?`)
      params.push(value)
    }
  })

  if (sets.length === 0) return

  params.push(id)
  await conn.execute(`UPDATE visita SET ${sets.join(", ")}, fecha_modificacion = NOW() WHERE id = ?`, params)
}

export async function obtenerMotivosCancelacion(): Promise<MotivoCancelacion[]> {
  const conn = await getConnection()
  const [rows] = await conn.execute<any[]>("SELECT id, descripcion as nombre FROM motivo_cancelacion ORDER BY descripcion")
  return rows
}

export async function registrarTrazabilidad(data: {
  visita_id: number
  usuario_id: number
  accion: string
  detalles: string
}): Promise<void> {
  const conn = await getConnection()
  await conn.execute("INSERT INTO trazabilidad (id_usuario, accion, descripcion) VALUES (?, ?, ?)", [
    data.usuario_id,
    data.accion,
    data.detalles,
  ])
}

export async function obtenerUsuarios(rol?: "JEFE" | "ASESOR"): Promise<Usuario[]> {
  const conn = await getConnection()
  let query = "SELECT id, nombre, correo, rol, '' as area, fecha_creacion as created_at FROM usuario"
  const params: any[] = []

  if (rol) {
    query += " WHERE rol = ?"
    params.push(rol)
  }

  query += " ORDER BY nombre"

  const [rows] = await conn.execute<any[]>(query, params)
  return rows
}


