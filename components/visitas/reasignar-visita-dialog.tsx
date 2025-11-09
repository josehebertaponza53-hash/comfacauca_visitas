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

interface Usuario {
  id: number
  nombre: string
  area: string
}

interface ReasignarVisitaDialogProps {
  visitaId: number
  abierto: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ReasignarVisitaDialog({ visitaId, abierto, onClose, onSuccess }: ReasignarVisitaDialogProps) {
  const { toast } = useToast()
  const [cargando, setCargando] = useState(false)
  const [asesores, setAsesores] = useState<Usuario[]>([])
  const [formData, setFormData] = useState({
    nuevo_asesor_id: "",
    motivo: "",
  })

  useEffect(() => {
    if (abierto) {
      cargarAsesores()
    }
  }, [abierto])

  const cargarAsesores = async () => {
    try {
      const response = await fetch("/api/usuarios?rol=ASESOR")
      const data = await response.json()
      if (data.success) {
        setAsesores(data.data)
      }
    } catch (error) {
      console.error("Error al cargar asesores:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCargando(true)

    try {
      const response = await fetch(`/api/visitas/${visitaId}/reasignar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nuevo_asesor_id: Number.parseInt(formData.nuevo_asesor_id),
          motivo: formData.motivo,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al reasignar visita")
      }

      toast({
        title: "Visita reasignada",
        description: "La visita ha sido reasignada exitosamente",
      })

      setFormData({ nuevo_asesor_id: "", motivo: "" })
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
            <DialogTitle>Reasignar Visita</DialogTitle>
            <DialogDescription>Selecciona el nuevo asesor para esta visita</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="asesor">Nuevo Asesor</Label>
              <Select
                value={formData.nuevo_asesor_id}
                onValueChange={(value) => setFormData({ ...formData, nuevo_asesor_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar asesor" />
                </SelectTrigger>
                <SelectContent>
                  {asesores.map((asesor) => (
                    <SelectItem key={asesor.id} value={asesor.id.toString()}>
                      {asesor.nombre} - {asesor.area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="motivo">Motivo (opcional)</Label>
              <Textarea
                id="motivo"
                value={formData.motivo}
                onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                placeholder="Describe el motivo de la reasignación"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={cargando}>
              Cancelar
            </Button>
            <Button type="submit" disabled={cargando}>
              {cargando ? "Reasignando..." : "Reasignar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
