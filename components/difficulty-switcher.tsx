"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Zap, TrendingUp, Target, Crown, Trophy, Sparkles, ChevronDown } from "lucide-react"
import type { AIDifficulty } from "@/lib/chess-ai"
import { useState } from "react"

interface DifficultySwitcherProps {
  currentDifficulty: AIDifficulty
  onDifficultyChange: (difficulty: AIDifficulty) => void
  disabled?: boolean
}

const difficultyConfig = {
  beginner: {
    icon: Zap,
    label: "Beginner",
    description: "ELO 800",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  intermediate: {
    icon: TrendingUp,
    label: "Intermediate",
    description: "ELO 1200",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  advanced: {
    icon: Target,
    label: "Advanced",
    description: "ELO 1600",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
  expert: {
    icon: Crown,
    label: "Expert",
    description: "ELO 2000",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  master: {
    icon: Trophy,
    label: "Master",
    description: "ELO 2400",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
  grandmaster: {
    icon: Sparkles,
    label: "Grandmaster",
    description: "ELO 2800",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
}

export default function DifficultySwitcher({
  currentDifficulty,
  onDifficultyChange,
  disabled = false,
}: DifficultySwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)

  const currentConfig = difficultyConfig[currentDifficulty] || difficultyConfig.intermediate
  const CurrentIcon = currentConfig.icon

  return (
    <div className="relative">
      <Button
        variant="outline"
        className="w-full justify-between bg-card"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <div className="flex items-center gap-2">
          <CurrentIcon className={`w-4 h-4 ${currentConfig.color}`} />
          <span className="font-medium">{currentConfig.label}</span>
          <span className="text-xs text-muted-foreground hidden sm:inline">{currentConfig.description}</span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <Card className="absolute top-full mt-2 w-full z-20 p-2 space-y-1">
            {(Object.keys(difficultyConfig) as AIDifficulty[]).map((difficulty) => {
              const config = difficultyConfig[difficulty]
              const Icon = config.icon
              const isActive = difficulty === currentDifficulty

              return (
                <button
                  key={difficulty}
                  onClick={() => {
                    onDifficultyChange(difficulty)
                    setIsOpen(false)
                  }}
                  className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                    isActive
                      ? "border-primary bg-primary/10"
                      : "border-transparent hover:border-primary/30 hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${isActive ? config.bgColor : "bg-muted"}`}>
                      <Icon className={`w-4 h-4 ${isActive ? config.color : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{config.label}</div>
                      <div className="text-xs text-muted-foreground">{config.description}</div>
                    </div>
                  </div>
                </button>
              )
            })}
          </Card>
        </>
      )}
    </div>
  )
}
