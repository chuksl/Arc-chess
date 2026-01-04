export interface UserStats {
  address: string
  wins: number
  losses: number
  draws: number
  totalGames: number
  rating: number
  createdAt: number
  lastUpdated: number
}

export interface GameResult {
  gameId: string
  playerAddress: string
  opponentAddress: string | null
  result: "win" | "loss" | "draw"
  gameMode: "single" | "multi"
  timestamp: number
}

export function getUserStats(address: string): UserStats {
  if (typeof window === "undefined") {
    return createDefaultStats(address)
  }

  const stored = localStorage.getItem(`chess_stats_${address.toLowerCase()}`)
  if (stored) {
    return JSON.parse(stored)
  }

  return createDefaultStats(address)
}

function createDefaultStats(address: string): UserStats {
  return {
    address: address.toLowerCase(),
    wins: 0,
    losses: 0,
    draws: 0,
    totalGames: 0,
    rating: 1200, // Starting ELO rating
    createdAt: Date.now(),
    lastUpdated: Date.now(),
  }
}

export function updateUserStats(address: string, result: "win" | "loss" | "draw", opponentRating?: number): UserStats {
  const stats = getUserStats(address)

  stats.totalGames++
  if (result === "win") {
    stats.wins++
  } else if (result === "loss") {
    stats.losses++
  } else {
    stats.draws++
  }

  if (opponentRating) {
    stats.rating = calculateNewRating(stats.rating, opponentRating, result)
  } else {
    // vs AI, smaller rating changes
    const aiRating = 1200
    stats.rating = calculateNewRating(stats.rating, aiRating, result, 0.5)
  }

  stats.lastUpdated = Date.now()

  if (typeof window !== "undefined") {
    localStorage.setItem(`chess_stats_${address.toLowerCase()}`, JSON.stringify(stats))
  }

  return stats
}

function calculateNewRating(
  playerRating: number,
  opponentRating: number,
  result: "win" | "loss" | "draw",
  kFactor = 1.0,
): number {
  const K = 32 * kFactor // ELO K-factor
  const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400))

  const actualScore = result === "win" ? 1 : result === "draw" ? 0.5 : 0
  const newRating = playerRating + K * (actualScore - expectedScore)

  return Math.round(newRating)
}

export function getWinRate(stats: UserStats): number {
  if (stats.totalGames === 0) return 0
  return Math.round((stats.wins / stats.totalGames) * 100)
}

export function saveGameResult(result: GameResult): void {
  if (typeof window === "undefined") return

  const history = getGameHistory(result.playerAddress)
  history.unshift(result)

  // Keep last 50 games
  const trimmed = history.slice(0, 50)
  localStorage.setItem(`chess_history_${result.playerAddress.toLowerCase()}`, JSON.stringify(trimmed))
}

export function getGameHistory(address: string): GameResult[] {
  if (typeof window === "undefined") return []

  const stored = localStorage.getItem(`chess_history_${address.toLowerCase()}`)
  if (stored) {
    return JSON.parse(stored)
  }
  return []
}
