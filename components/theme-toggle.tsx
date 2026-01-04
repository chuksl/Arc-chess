"use client"

import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/lib/theme-provider"
import { useEffect, useState } from "react"

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="w-9 h-9">
        <Sun className="w-4 h-4" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  return (
    <Button onClick={toggleTheme} variant="ghost" size="icon" className="w-9 h-9">
      {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
