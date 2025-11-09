"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface EjecutarVisitaDialogProps {
  visitaId: number
  estadoActual: string
  abierto: boolean
  onClose: () => void
  onSuccess: () => void
}

export function EjecutarVisitaDialog({
  visitaId,
  estadoActual,
  abierto,
  onClose,
  onSuccess,
}: EjecutarVisitaDialogProps) {
  const { toast } = useToast()
  const [cargando, setCargando] = useState(false)
  const [observaciones, setObservaciones] = useState("")

  const nuevoEstado = estadoActual === "PROGRAMADA" ? "EN_EJECUCION" : "EJECUTADA"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCargando(true)

    try {
      const response = await fetch(`/api/visitas/${visitaId}/ejecutar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estado: nuevoEstado,
          observaciones,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al actualizar visita")
      }

      toast({
        title: nuevoEstado === "EN_EJECUCION" ? "Visita iniciada" : "Visita completada",
        description: data.message,
      })

      setObservaciones("")
      onSuccess()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setCargando(false)
    }
  }

  return (
    <Dialog open={abierto} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{nuevoEstado === "EN_EJECUCION" ? "Iniciar Visita" : "Completar Visita"}</DialogTitle>
            <DialogDescription>
              {nuevoEstado === "EN_EJECUCION"
                ? "Marca la visita como en ejecución"
                : "Finaliza la visita y agrega tus observaciones"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="observaciones">
                Observaciones {nuevoEstado === "EJECUTADA" ? "(requeridas)" : "(opcionales)"}
              </Label>
              <Textarea
                id="observaciones"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Agrega observaciones sobre la visita"
                rows={4}
                required={nuevoEstado === "EJECUTADA"}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={cargando}>
              Cancelar
            </Button>
            <Button type="submit" disabled={cargando}>
              {cargando ? "Guardando..." : nuevoEstado === "EN_EJECUCION" ? "Iniciar" : "Completar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
