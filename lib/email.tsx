import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number.parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function enviarOTP(email: string, code: string): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Comfacauca" <noreply@comfacauca.com>',
      to: email,
      subject: "Código de verificación - Gestor de Visitas",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4338ca;">Código de Verificación</h2>
          <p>Tu código de verificación para acceder al Gestor de Visitas Comfacauca es:</p>
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #4338ca; letter-spacing: 8px; margin: 0;">${code}</h1>
          </div>
          <p style="color: #6b7280;">Este código expira en 10 minutos.</p>
          <p style="color: #6b7280; font-size: 12px;">Si no solicitaste este código, puedes ignorar este correo.</p>
        </div>
      `,
    })
    return true
  } catch (error) {
    console.error("Error al enviar OTP:", error)
    return false
  }
}
