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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Usuario {
  id: number
  nombre: string
  area: string
}

interface CrearVisitaDialogProps {
  onSuccess: () => void
}

export function CrearVisitaDialog({ onSuccess }: CrearVisitaDialogProps) {
  const { toast } = useToast()
  const [abierto, setAbierto] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [asesores, setAsesores] = useState<Usuario[]>([])
  const [formData, setFormData] = useState({
    asesor_id: "",
    objetivo: "",
    tipo: "",
    fecha_programada: "",
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
      const response = await fetch("/api/visitas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          asesor_id: Number.parseInt(formData.asesor_id),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al crear visita")
      }

      toast({
        title: "Visita creada",
        description: "La visita ha sido programada exitosamente",
      })

      setFormData({
        asesor_id: "",
        objetivo: "",
        tipo: "",
        fecha_programada: "",
      })
      setAbierto(false)
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
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Visita
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Programar Nueva Visita</DialogTitle>
            <DialogDescription>Completa los datos para programar una visita</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="asesor">Asesor</Label>
              <Select
                value={formData.asesor_id}
                onValueChange={(value) => setFormData({ ...formData, asesor_id: value })}
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
              <Label htmlFor="tipo">Tipo de Visita</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMPRESARIAL">Empresarial</SelectItem>
                  <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="objetivo">Objetivo / Empresa</Label>
              <Textarea
                id="objetivo"
                value={formData.objetivo}
                onChange={(e) => setFormData({ ...formData, objetivo: e.target.value })}
                placeholder="Describe el objetivo de la visita"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha Programada</Label>
              <Input
                id="fecha"
                type="datetime-local"
                value={formData.fecha_programada}
                onChange={(e) => setFormData({ ...formData, fecha_programada: e.target.value })}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAbierto(false)} disabled={cargando}>
              Cancelar
            </Button>
            <Button type="submit" disabled={cargando}>
              {cargando ? "Creando..." : "Crear Visita"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
