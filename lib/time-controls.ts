export type TimeControl = "blitz" | "rapid" | "classical" | "unlimited"

export interface TimeControlConfig {
  name: string
  description: string
  initialTime: number
  increment: number
  icon: string
}

export const timeControls: Record<TimeControl, TimeControlConfig> = {
  blitz: {
    name: "Blitz",
    description: "3 min + 2 sec",
    initialTime: 180000,
    increment: 2000,
    icon: "⚡",
  },
  rapid: {
    name: "Rapid",
    description: "10 min + 5 sec",
    initialTime: 600000,
    increment: 5000,
    icon: "🏃",
  },
  classical: {
    name: "Classical",
    description: "30 min + 30 sec",
    initialTime: 1800000,
    increment: 30000,
    icon: "♟️",
  },
  unlimited: {
    name: "Unlimited",
    description: "No time limit",
    initialTime: 0,
    increment: 0,
    icon: "∞",
  },
}

export interface GameTimer {
  white: number
  black: number
  lastMoveTime: number | null
  isRunning: boolean
  currentPlayer: "white" | "black"
}

export function createTimer(timeControl: TimeControl): GameTimer {
  const config = timeControls[timeControl]
  return {
    white: config.initialTime,
    black: config.initialTime,
    lastMoveTime: null,
    isRunning: false,
    currentPlayer: "white",
  }
}

export function updateTimer(
  timer: GameTimer,
  timeControl: TimeControl,
  deltaTime: number,
): { timer: GameTimer; timeExpired: boolean } {
  if (!timer.isRunning || timeControl === "unlimited") {
    return { timer, timeExpired: false }
  }

  const newTimer = { ...timer }
  const config = timeControls[timeControl]

  if (timer.currentPlayer === "white") {
    newTimer.white = Math.max(0, timer.white - deltaTime)
    if (newTimer.white === 0) {
      return { timer: newTimer, timeExpired: true }
    }
  } else {
    newTimer.black = Math.max(0, timer.black - deltaTime)
    if (newTimer.black === 0) {
      return { timer: newTimer, timeExpired: true }
    }
  }

  return { timer: newTimer, timeExpired: false }
}

export function switchPlayer(timer: GameTimer, timeControl: TimeControl, player: "white" | "black"): GameTimer {
  const config = timeControls[timeControl]
  const newTimer = { ...timer, currentPlayer: player }

  if (timeControl !== "unlimited" && timer.lastMoveTime !== null) {
    if (timer.currentPlayer === "white") {
      newTimer.white += config.increment
    } else {
      newTimer.black += config.increment
    }
  }

  newTimer.lastMoveTime = Date.now()
  return newTimer
}

export function formatTime(milliseconds: number): string {
  if (milliseconds === 0) return "∞"

  const totalSeconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}
