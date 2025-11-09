// Almacenamiento temporal de OTPs (en producción usar Redis)
interface OTPData {
  code: string
  expiresAt: number
  email: string
}

const otpStore = new Map<string, OTPData>()

export function guardarOTP(email: string, code: string): void {
  otpStore.set(email, {
    code,
    email,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutos
  })
}

export function verificarOTP(email: string, code: string): boolean {
  const data = otpStore.get(email)

  if (!data) return false
  if (data.expiresAt < Date.now()) {
    otpStore.delete(email)
    return false
  }
  if (data.code !== code) return false

  otpStore.delete(email)
  return true
}

export function limpiarOTPsExpirados(): void {
  const now = Date.now()
  for (const [email, data] of otpStore.entries()) {
    if (data.expiresAt < now) {
      otpStore.delete(email)
    }
  }
}

// Limpiar OTPs expirados cada 5 minutos
setInterval(limpiarOTPsExpirados, 5 * 60 * 1000)
