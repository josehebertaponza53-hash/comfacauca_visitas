"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { ReasignarVisitaDialog } from "./reasignar-visita-dialog"
import { CancelarVisitaDialog } from "./cancelar-visita-dialog"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Visita {
  id: number
  objetivo: string
  tipo: string
  estado: string
  fecha_programada: string
  asesor_nombre: string
  asesor_area: string
  programada_por_nombre: string
  motivo_cancelacion?: string
}

interface TablaVisitasProps {
  visitas: Visita[]
  onUpdate: () => void
}

const getBadgeVariant = (estado: string) => {
  switch (estado) {
    case "PROGRAMADA":
      return "default"
    case "EN_EJECUCION":
      return "secondary"
    case "EJECUTADA":
      return "default"
    case "REASIGNADA":
      return "secondary"
    case "CANCELADA":
      return "destructive"
    default:
      return "default"
  }
}

const formatEstado = (estado: string) => {
  const estados: Record<string, string> = {
    PROGRAMADA: "Programada",
    EN_EJECUCION: "En Ejecución",
    EJECUTADA: "Ejecutada",
    REASIGNADA: "Reasignada",
    CANCELADA: "Cancelada",
  }
  return estados[estado] || estado
}

export function TablaVisitas({ visitas, onUpdate }: TablaVisitasProps) {
  const [visitaSeleccionada, setVisitaSeleccionada] = useState<number | null>(null)
  const [dialogAbierto, setDialogAbierto] = useState<"reasignar" | "cancelar" | null>(null)

  const handleAccion = (visitaId: number, accion: "reasignar" | "cancelar") => {
    setVisitaSeleccionada(visitaId)
    setDialogAbierto(accion)
  }

  const handleSuccess = () => {
    setDialogAbierto(null)
    setVisitaSeleccionada(null)
    onUpdate()
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asesor</TableHead>
              <TableHead>Objetivo</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visitas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No hay visitas registradas
                </TableCell>
              </TableRow>
            ) : (
              visitas.map((visita) => (
                <TableRow key={visita.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{visita.asesor_nombre}</p>
                      <p className="text-sm text-muted-foreground">{visita.asesor_area}</p>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="truncate">{visita.objetivo}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{visita.tipo === "EMPRESARIAL" ? "Empresarial" : "Individual"}</Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(visita.fecha_programada), "d MMM yyyy 'a las' HH:mm", {
                      locale: es,
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(visita.estado)}>{formatEstado(visita.estado)}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleAccion(visita.id, "reasignar")}>
                          Reasignar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAccion(visita.id, "cancelar")}>
                          Cancelar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {visitaSeleccionada && (
        <>
          <ReasignarVisitaDialog
            visitaId={visitaSeleccionada}
            abierto={dialogAbierto === "reasignar"}
            onClose={() => setDialogAbierto(null)}
            onSuccess={handleSuccess}
          />
          <CancelarVisitaDialog
            visitaId={visitaSeleccionada}
            abierto={dialogAbierto === "cancelar"}
            onClose={() => setDialogAbierto(null)}
            onSuccess={handleSuccess}
          />
        </>
      )}
    </>
  )
}
