"use client"

import { useState, useEffect } from "react"
import { NavBar } from "@/components/layout/nav-bar"
import { TablaVisitas } from "@/components/visitas/tabla-visitas"
import { CrearVisitaDialog } from "@/components/visitas/crear-visita-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CalendarIcon, Users, ClipboardList, TrendingUp } from "lucide-react"

interface Usuario {
  id: number
  nombre: string
  email: string
  rol: string
  area: string
}

export default function JefePage() {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [visitas, setVisitas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtros, setFiltros] = useState({
    asesor_id: "all", // Updated default value to 'all'
    fecha: "",
    estado: "all", // Updated default value to 'all'
  })
  const [asesores, setAsesores] = useState<Usuario[]>([])
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    programadas: 0,
    ejecutadas: 0,
    canceladas: 0,
  })

  useEffect(() => {
    cargarDatos()
  }, [filtros])

  const cargarDatos = async () => {
    try {
      // Cargar usuario
      const usuarioRes = await fetch("/api/auth/me")
      const usuarioData = await usuarioRes.json()
      if (usuarioData.success) {
        setUsuario(usuarioData.data)
      }

      // Cargar asesores para filtros
      const asesoresRes = await fetch("/api/usuarios?rol=ASESOR")
      const asesoresData = await asesoresRes.json()
      if (asesoresData.success) {
        setAsesores(asesoresData.data)
      }

      // Cargar visitas
      await cargarVisitas()
    } catch (error) {
      console.error("Error al cargar datos:", error)
    } finally {
      setCargando(false)
    }
  }

  const cargarVisitas = async () => {
    try {
      const params = new URLSearchParams()
      if (filtros.asesor_id !== "all") params.append("asesor_id", filtros.asesor_id)
      if (filtros.fecha) params.append("fecha", filtros.fecha)
      if (filtros.estado !== "all") params.append("estado", filtros.estado)

      const response = await fetch(`/api/visitas?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setVisitas(data.data)
        calcularEstadisticas(data.data)
      }
    } catch (error) {
      console.error("Error al cargar visitas:", error)
    }
  }

  const calcularEstadisticas = (visitas: any[]) => {
    setEstadisticas({
      total: visitas.length,
      programadas: visitas.filter((v) => v.estado === "PROGRAMADA").length,
      ejecutadas: visitas.filter((v) => v.estado === "EJECUTADA").length,
      canceladas: visitas.filter((v) => v.estado === "CANCELADA").length,
    })
  }

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <NavBar usuario={usuario ? { nombre: usuario.email, rol: "Jefe", area: "Administración" } : undefined} />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Panel de Gestión</h1>
              <p className="text-muted-foreground mt-1">Administra y programa visitas para tu equipo</p>
            </div>
            <CrearVisitaDialog onSuccess={cargarVisitas} />
          </div>

          {/* Estadísticas */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Visitas</CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estadisticas.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Programadas</CardTitle>
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estadisticas.programadas}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ejecutadas</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estadisticas.ejecutadas}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Canceladas</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estadisticas.canceladas}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
              <CardDescription>Filtra las visitas según tus necesidades</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Asesor</Label>
                  <Select
                    value={filtros.asesor_id}
                    onValueChange={(value) => setFiltros({ ...filtros, asesor_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los asesores" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem> // Updated value to 'all'
                      {asesores.map((asesor) => (
                        <SelectItem key={asesor.id} value={asesor.id.toString()}>
                          {asesor.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Fecha</Label>
                  <Input
                    type="date"
                    value={filtros.fecha}
                    onChange={(e) => setFiltros({ ...filtros, fecha: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select value={filtros.estado} onValueChange={(value) => setFiltros({ ...filtros, estado: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los estados" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem> // Updated value to 'all'
                      <SelectItem value="PROGRAMADA">Programada</SelectItem>
                      <SelectItem value="EN_EJECUCION">En Ejecución</SelectItem>
                      <SelectItem value="EJECUTADA">Ejecutada</SelectItem>
                      <SelectItem value="REASIGNADA">Reasignada</SelectItem>
                      <SelectItem value="CANCELADA">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabla de visitas */}
          <Card>
            <CardHeader>
              <CardTitle>Visitas</CardTitle>
              <CardDescription>Listado completo de todas las visitas</CardDescription>
            </CardHeader>
            <CardContent>
              <TablaVisitas visitas={visitas} onUpdate={cargarVisitas} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
