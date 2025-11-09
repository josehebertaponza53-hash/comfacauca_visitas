"use client"

import { useState, useEffect } from "react"
import { NavBar } from "@/components/layout/nav-bar"
import { TarjetaVisita } from "@/components/visitas/tarjeta-visita"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CalendarIcon, ClipboardCheck, Clock, Info } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Usuario {
  id: number
  nombre: string
  email: string
  rol: string
  area: string
}

interface Visita {
  id: number
  objetivo: string
  tipo: string
  estado: string
  fecha_programada: string
  observaciones?: string
}

export default function AsesorPage() {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [visitasHoy, setVisitasHoy] = useState<Visita[]>([])
  const [visitasProximas, setVisitasProximas] = useState<Visita[]>([])
  const [visitasCompletadas, setVisitasCompletadas] = useState<Visita[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      // Cargar usuario
      const usuarioRes = await fetch("/api/auth/me")
      const usuarioData = await usuarioRes.json()
      if (usuarioData.success) {
        setUsuario(usuarioData.data)
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
      const response = await fetch("/api/visitas")
      const data = await response.json()

      if (data.success) {
        const hoy = format(new Date(), "yyyy-MM-dd")
        const visitas = data.data

        // Filtrar visitas de hoy (programadas o en ejecución)
        const hoyList = visitas.filter((v: Visita) => {
          const fechaVisita = format(new Date(v.fecha_programada), "yyyy-MM-dd")
          return fechaVisita === hoy && (v.estado === "PROGRAMADA" || v.estado === "EN_EJECUCION")
        })

        // Filtrar visitas próximas (futuras y programadas)
        const proximasList = visitas.filter((v: Visita) => {
          const fechaVisita = format(new Date(v.fecha_programada), "yyyy-MM-dd")
          return fechaVisita > hoy && v.estado === "PROGRAMADA"
        })

        // Filtrar visitas completadas
        const completadasList = visitas.filter((v: Visita) => v.estado === "EJECUTADA" || v.estado === "CANCELADA")

        setVisitasHoy(hoyList)
        setVisitasProximas(proximasList)
        setVisitasCompletadas(completadasList)
      }
    } catch (error) {
      console.error("Error al cargar visitas:", error)
    }
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
      <NavBar usuario={usuario ? { nombre: usuario.email, rol: "Asesor", area: "Campo" } : undefined} />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mi Agenda</h1>
            <p className="text-muted-foreground mt-1">
              {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
            </p>
          </div>

          {/* Alerta informativa */}
          {visitasHoy.length > 0 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Tienes {visitasHoy.length} visita{visitasHoy.length !== 1 ? "s" : ""} programada
                {visitasHoy.length !== 1 ? "s" : ""} para hoy
              </AlertDescription>
            </Alert>
          )}

          {/* Estadísticas rápidas */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Visitas de Hoy</CardTitle>
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{visitasHoy.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Próximas</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{visitasProximas.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completadas</CardTitle>
                <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{visitasCompletadas.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs con visitas */}
          <Tabs defaultValue="hoy" className="space-y-4">
            <TabsList>
              <TabsTrigger value="hoy">Hoy ({visitasHoy.length})</TabsTrigger>
              <TabsTrigger value="proximas">Próximas ({visitasProximas.length})</TabsTrigger>
              <TabsTrigger value="completadas">Completadas ({visitasCompletadas.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="hoy" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Visitas de Hoy</CardTitle>
                  <CardDescription>Estas son tus visitas programadas para hoy</CardDescription>
                </CardHeader>
                <CardContent>
                  {visitasHoy.length === 0 ? (
                    <div className="text-center py-12">
                      <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                      <p className="mt-4 text-muted-foreground">No tienes visitas programadas para hoy</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {visitasHoy.map((visita) => (
                        <TarjetaVisita key={visita.id} visita={visita} onUpdate={cargarVisitas} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="proximas" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Próximas Visitas</CardTitle>
                  <CardDescription>Visitas programadas para los próximos días</CardDescription>
                </CardHeader>
                <CardContent>
                  {visitasProximas.length === 0 ? (
                    <div className="text-center py-12">
                      <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
                      <p className="mt-4 text-muted-foreground">No tienes visitas próximas programadas</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {visitasProximas.map((visita) => (
                        <TarjetaVisita key={visita.id} visita={visita} onUpdate={cargarVisitas} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="completadas" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Visitas Completadas</CardTitle>
                  <CardDescription>Historial de visitas ejecutadas y canceladas</CardDescription>
                </CardHeader>
                <CardContent>
                  {visitasCompletadas.length === 0 ? (
                    <div className="text-center py-12">
                      <ClipboardCheck className="mx-auto h-12 w-12 text-muted-foreground" />
                      <p className="mt-4 text-muted-foreground">No tienes visitas completadas aún</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {visitasCompletadas.map((visita) => (
                        <TarjetaVisita key={visita.id} visita={visita} onUpdate={cargarVisitas} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
