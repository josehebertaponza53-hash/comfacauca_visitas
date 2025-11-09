"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GoogleLoginButton } from "@/components/google-login-button"
import { OTPInput } from "@/components/otp-input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [paso, setPaso] = useState<"google" | "otp">("google")
  const [email, setEmail] = useState("")
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState("")
  const [exito, setExito] = useState("")

  const handleGoogleSuccess = async (userEmail: string, nombre: string) => {
    setCargando(true)
    setError("")
    setExito("")

    try {
      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, nombre }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al autenticar")
      }

      setEmail(userEmail)
      setExito("Código enviado a tu correo")
      setPaso("otp")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  const handleOTPComplete = async (code: string) => {
    setCargando(true)
    setError("")

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Código inválido")
      }

      // Redirigir según el rol
      const usuario = data.data.usuario
      if (usuario.rol === "JEFE") {
        router.push("/jefe")
      } else {
        router.push("/asesor")
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  const reenviarCodigo = async () => {
    setCargando(true)
    setError("")
    setExito("")

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al reenviar código")
      }

      setExito("Código reenviado exitosamente")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo y título */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Comfacauca</h1>
          <p className="text-muted-foreground">Gestor de Visitas</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{paso === "google" ? "Iniciar Sesión" : "Verificación de Código"}</CardTitle>
            <CardDescription>
              {paso === "google"
                ? "Inicia sesión con tu cuenta de Google para continuar"
                : `Ingresa el código de 6 dígitos enviado a ${email}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {exito && (
              <Alert className="bg-secondary/20 text-secondary-foreground border-secondary">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>{exito}</AlertDescription>
              </Alert>
            )}

            {paso === "google" ? (
              <GoogleLoginButton onSuccess={handleGoogleSuccess} onError={setError} />
            ) : (
              <div className="space-y-4">
                <OTPInput length={6} onComplete={handleOTPComplete} disabled={cargando} />
                <div className="text-center">
                  <Button variant="link" onClick={reenviarCodigo} disabled={cargando} className="text-sm">
                    Reenviar código
                  </Button>
                </div>
                <Button variant="outline" onClick={() => setPaso("google")} className="w-full" disabled={cargando}>
                  Volver
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">Sistema seguro con autenticación de dos factores</p>
      </div>
    </div>
  )
}
