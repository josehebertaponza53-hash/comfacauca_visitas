"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User, Building2 } from "lucide-react"

interface NavBarProps {
  usuario?: {
    nombre: string
    rol: string
    area: string
  }
}

export function NavBar({ usuario }: NavBarProps) {
  const router = useRouter()
  const [cargando, setCargando] = useState(false)

  const handleLogout = async () => {
    setCargando(true)
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/login")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    } finally {
      setCargando(false)
    }
  }

  return (
    <nav className="border-b border-border bg-card">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-foreground">Comfacauca</h1>
              <p className="text-xs text-muted-foreground">Gestor de Visitas</p>
            </div>
          </div>

          {usuario && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <User className="mr-2 h-4 w-4" />
                  {usuario.nombre}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5 text-sm">
                  <p className="text-muted-foreground text-xs">Rol</p>
                  <p className="font-medium">{usuario.rol}</p>
                </div>
                <div className="px-2 py-1.5 text-sm">
                  <p className="text-muted-foreground text-xs">Área</p>
                  <p className="font-medium">{usuario.area}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} disabled={cargando}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  )
}
