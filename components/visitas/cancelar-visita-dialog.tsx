"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface MotivoCancelacion {
  id: number
  nombre: string
  descripcion: string
}

interface CancelarVisitaDialogProps {
  visitaId: number
  abierto: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CancelarVisitaDialog({ visitaId, abierto, onClose, onSuccess }: CancelarVisitaDialogProps) {
  const { toast } = useToast()
  const [cargando, setCargando] = useState(false)
  const [motivos, setMotivos] = useState<MotivoCancelacion[]>([])
  const [formData, setFormData] = useState({
    motivo_cancelacion_id: "",
    observaciones: "",
  })

  useEffect(() => {
    if (abierto) {
      cargarMotivos()
    }
  }, [abierto])

  const cargarMotivos = async () => {
    try {
      const response = await fetch("/api/motivos-cancelacion")
      const data = await response.json()
      if (data.success) {
        setMotivos(data.data)
      }
    } catch (error) {
      console.error("Error al cargar motivos:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCargando(true)

    try {
      const response = await fetch(`/api/visitas/${visitaId}/cancelar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          motivo_cancelacion_id: Number.parseInt(formData.motivo_cancelacion_id),
          observaciones: formData.observaciones,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al cancelar visita")
      }

      toast({
        title: "Visita cancelada",
        description: "La visita ha sido cancelada exitosamente",
      })

      setFormData({ motivo_cancelacion_id: "", observaciones: "" })
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
            <DialogTitle>Cancelar Visita</DialogTitle>
            <DialogDescription>Selecciona el motivo de cancelación</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="motivo">Motivo</Label>
              <Select
                value={formData.motivo_cancelacion_id}
                onValueChange={(value) => setFormData({ ...formData, motivo_cancelacion_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar motivo" />
                </SelectTrigger>
                <SelectContent>
                  {motivos.map((motivo) => (
                    <SelectItem key={motivo.id} value={motivo.id.toString()}>
                      {motivo.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones (opcional)</Label>
              <Textarea
                id="observaciones"
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                placeholder="Agrega observaciones adicionales"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={cargando}>
              Volver
            </Button>
            <Button type="submit" variant="destructive" disabled={cargando}>
              {cargando ? "Cancelando..." : "Cancelar Visita"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
