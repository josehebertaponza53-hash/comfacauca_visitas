// Tipos de base de datos
export interface Usuario {
  id: number
  nombre: string
  email: string
  rol: "JEFE" | "ASESOR"
  area: string
  created_at: string
}

export interface Visita {
  id: number
  asesor_id: number
  objetivo: string
  tipo: "EMPRESARIAL" | "INDIVIDUAL"
  estado: "PROGRAMADA" | "EN_EJECUCION" | "REASIGNADA" | "CANCELADA" | "EJECUTADA"
  fecha_programada: string
  motivo_cancelacion_id?: number
  observaciones?: string
  programada_por_id: number
  reasignada_por_id?: number
  cancelada_por_id?: number
  modificado_por?: number
  created_at: string
  updated_at: string
}

export interface MotivoCancelacion {
  id: number
  nombre: string
  descripcion: string
}

export interface Trazabilidad {
  id: number
  visita_id: number
  usuario_id: number
  accion: "PROGRAMAR" | "REASIGNAR" | "CANCELAR" | "EJECUTAR"
  detalles: string
  fecha: string
}

// Tipos de respuesta API
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface VisitaConAsesor extends Visita {
  asesor_nombre: string
  asesor_area: string
  programada_por_nombre: string
  motivo_cancelacion?: string
}
