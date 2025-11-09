"use client"

import { useState, useRef, type KeyboardEvent, type ClipboardEvent } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface OTPInputProps {
  length?: number
  onComplete: (code: string) => void
  disabled?: boolean
}

export function OTPInput({ length = 6, onComplete, disabled = false }: OTPInputProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(""))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (index: number, value: string) => {
    if (disabled) return

    // Solo permitir números
    const newValue = value.replace(/[^0-9]/g, "")

    if (newValue.length > 1) {
      // Si se pega más de un carácter
      handlePaste(index, newValue)
      return
    }

    const newValues = [...values]
    newValues[index] = newValue
    setValues(newValues)

    // Auto-focus al siguiente input
    if (newValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    // Verificar si está completo
    if (newValues.every((v) => v !== "")) {
      onComplete(newValues.join(""))
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !values[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (startIndex: number, pasteData: string) => {
    const numbers = pasteData.replace(/[^0-9]/g, "").split("")
    const newValues = [...values]

    numbers.forEach((num, i) => {
      const targetIndex = startIndex + i
      if (targetIndex < length) {
        newValues[targetIndex] = num
      }
    })

    setValues(newValues)

    // Focus al último input completado
    const lastFilledIndex = Math.min(startIndex + numbers.length - 1, length - 1)
    inputRefs.current[lastFilledIndex]?.focus()

    // Verificar si está completo
    if (newValues.every((v) => v !== "")) {
      onComplete(newValues.join(""))
    }
  }

  const handlePasteEvent = (e: ClipboardEvent<HTMLInputElement>, index: number) => {
    e.preventDefault()
    const pasteData = e.clipboardData.getData("text")
    handlePaste(index, pasteData)
  }

  return (
    <div className="flex gap-2 justify-center">
      {values.map((value, index) => (
        <Input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={(e) => handlePasteEvent(e, index)}
          disabled={disabled}
          className={cn(
            "w-12 h-14 text-center text-2xl font-semibold",
            "focus-visible:ring-2 focus-visible:ring-primary",
          )}
        />
      ))}
    </div>
  )
}
