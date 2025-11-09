"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Building2, User, Play, CheckCircle2, X } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CancelarVisitaDialog } from "./cancelar-visita-dialog"
import { EjecutarVisitaDialog } from "./ejecutar-visita-dialog"

interface Visita {
  id: number
  objetivo: string
  tipo: string
  estado: string
  fecha_programada: string
  observaciones?: string
}

interface TarjetaVisitaProps {
  visita: Visita
  onUpdate: () => void
}

export function TarjetaVisita({ visita, onUpdate }: TarjetaVisitaProps) {
  const [dialogAbierto, setDialogAbierto] = useState<"cancelar" | "ejecutar" | null>(null)

  const puedeEjecutar = visita.estado === "PROGRAMADA" || visita.estado === "EN_EJECUCION"
  const esHoy = format(new Date(visita.fecha_programada), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")

  const handleSuccess = () => {
    setDialogAbierto(null)
    onUpdate()
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {visita.tipo === "EMPRESARIAL" ? (
                <Building2 className="h-5 w-5 text-primary" />
              ) : (
                <User className="h-5 w-5 text-secondary" />
              )}
              <Badge variant="outline">{visita.tipo === "EMPRESARIAL" ? "Empresarial" : "Individual"}</Badge>
            </div>
            {visita.estado === "PROGRAMADA" && <Badge>{esHoy ? "Hoy" : "Programada"}</Badge>}
            {visita.estado === "EN_EJECUCION" && <Badge variant="secondary">En Ejecución</Badge>}
            {visita.estado === "EJECUTADA" && <Badge>Ejecutada</Badge>}
            {visita.estado === "CANCELADA" && <Badge variant="destructive">Cancelada</Badge>}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <p className="text-sm text-foreground font-medium line-clamp-2">{visita.objetivo}</p>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {format(new Date(visita.fecha_programada), "EEEE, d 'de' MMMM 'a las' HH:mm", {
                  locale: es,
                })}
              </p>
            </div>
          </div>

          {visita.observaciones && (
            <div className="pt-2 border-t border-border">
              <p className="text-sm text-muted-foreground italic line-clamp-2">{visita.observaciones}</p>
            </div>
          )}
        </CardContent>
        {puedeEjecutar && esHoy && (
          <CardFooter className="flex gap-2 pt-3 border-t border-border">
            {visita.estado === "PROGRAMADA" && (
              <Button onClick={() => setDialogAbierto("ejecutar")} className="flex-1" size="sm">
                <Play className="mr-2 h-4 w-4" />
                Iniciar
              </Button>
            )}
            {visita.estado === "EN_EJECUCION" && (
              <Button onClick={() => setDialogAbierto("ejecutar")} className="flex-1" size="sm">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Completar
              </Button>
            )}
            <Button onClick={() => setDialogAbierto("cancelar")} variant="outline" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </CardFooter>
        )}
      </Card>

      {dialogAbierto && (
        <>
          <CancelarVisitaDialog
            visitaId={visita.id}
            abierto={dialogAbierto === "cancelar"}
            onClose={() => setDialogAbierto(null)}
            onSuccess={handleSuccess}
          />
          <EjecutarVisitaDialog
            visitaId={visita.id}
            estadoActual={visita.estado}
            abierto={dialogAbierto === "ejecutar"}
            onClose={() => setDialogAbierto(null)}
            onSuccess={handleSuccess}
          />
        </>
      )}
    </>
  )
}
