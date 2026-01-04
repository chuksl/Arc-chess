"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Clock } from "lucide-react"
import { formatTime, type GameTimer, type TimeControl } from "@/lib/time-controls"

interface ChessClockProps {
  timer: GameTimer
  timeControl: TimeControl
  onTimeExpired: (player: "white" | "black") => void
}

export default function ChessClock({ timer, timeControl, onTimeExpired }: ChessClockProps) {
  const [displayTimer, setDisplayTimer] = useState(timer)

  useEffect(() => {
    if (!timer.isRunning || timeControl === "unlimited") {
      setDisplayTimer(timer)
      return
    }

    const interval = setInterval(() => {
      setDisplayTimer((prev) => {
        const deltaTime = 100
        const newTimer = { ...prev }

        if (prev.currentPlayer === "white") {
          newTimer.white = Math.max(0, prev.white - deltaTime)
          if (newTimer.white === 0) {
            onTimeExpired("white")
          }
        } else {
          newTimer.black = Math.max(0, prev.black - deltaTime)
          if (newTimer.black === 0) {
            onTimeExpired("black")
          }
        }

        return newTimer
      })
    }, 100)

    return () => clearInterval(interval)
  }, [timer, timeControl, onTimeExpired])

  useEffect(() => {
    setDisplayTimer(timer)
  }, [timer])

  if (timeControl === "unlimited") {
    return null
  }

  const isWhiteActive = displayTimer.currentPlayer === "white" && displayTimer.isRunning
  const isBlackActive = displayTimer.currentPlayer === "black" && displayTimer.isRunning

  return (
    <div className="grid grid-cols-2 gap-4 mb-4">
      <Card
        className={`p-4 transition-all ${
          isBlackActive ? "bg-primary/10 ring-2 ring-primary" : displayTimer.black === 0 ? "bg-destructive/20" : ""
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="font-medium">Black</span>
          </div>
          <span
            className={`text-2xl font-mono font-bold ${
              displayTimer.black < 60000 && displayTimer.black > 0 ? "text-destructive" : ""
            }`}
          >
            {formatTime(displayTimer.black)}
          </span>
        </div>
      </Card>

      <Card
        className={`p-4 transition-all ${
          isWhiteActive ? "bg-primary/10 ring-2 ring-primary" : displayTimer.white === 0 ? "bg-destructive/20" : ""
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="font-medium">White</span>
          </div>
          <span
            className={`text-2xl font-mono font-bold ${
              displayTimer.white < 60000 && displayTimer.white > 0 ? "text-destructive" : ""
            }`}
          >
            {formatTime(displayTimer.white)}
          </span>
        </div>
      </Card>
    </div>
  )
}
