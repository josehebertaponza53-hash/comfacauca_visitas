import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    success: true,
    data: [
      { value: "EMPRESARIAL", label: "Empresarial" },
      { value: "INDIVIDUAL", label: "Individual" },
    ],
  })
}
