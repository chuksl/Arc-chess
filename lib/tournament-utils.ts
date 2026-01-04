export interface Tournament {
  id: string
  name: string
  description: string
  entryFee: number
  prizePool: number
  startDate: number
  endDate: number
  maxParticipants: number
  currentParticipants: number
  status: "upcoming" | "active" | "completed"
  participants: TournamentParticipant[]
  matches: TournamentMatch[]
}

export interface TournamentParticipant {
  address: string
  joinedAt: number
  rating: number
  wins: number
  losses: number
  draws: number
}

export interface TournamentMatch {
  id: string
  player1: string
  player2: string
  winner: string | null
  completedAt: number | null
  gameId: string
}

export function getActiveTournaments(): Tournament[] {
  if (typeof window === "undefined") return []

  const stored = localStorage.getItem("chess_tournaments")
  if (stored) {
    const tournaments: Tournament[] = JSON.parse(stored)
    return tournaments.filter((t) => t.status === "active" && Date.now() < t.endDate)
  }

  return getDefaultTournaments()
}

export function getAllTournaments(): Tournament[] {
  if (typeof window === "undefined") return getDefaultTournaments()

  const stored = localStorage.getItem("chess_tournaments")
  if (stored) {
    return JSON.parse(stored)
  }

  const defaultTournaments = getDefaultTournaments()
  localStorage.setItem("chess_tournaments", JSON.stringify(defaultTournaments))
  return defaultTournaments
}

function getDefaultTournaments(): Tournament[] {
  const now = Date.now()
  const oneDay = 24 * 60 * 60 * 1000
  const oneHour = 60 * 60 * 1000

  return [
    {
      id: "daily_blitz",
      name: "Daily Blitz Challenge",
      description: "Fast-paced daily tournament. Available for 24 hours!",
      entryFee: 0.02,
      prizePool: 0.5,
      startDate: now,
      endDate: now + oneDay,
      maxParticipants: 16,
      currentParticipants: 7,
      status: "active",
      participants: [],
      matches: [],
    },
    {
      id: "weekend_masters",
      name: "Weekend Masters",
      description: "Premium weekend tournament with bigger prizes. 48 hours only!",
      entryFee: 0.05,
      prizePool: 2.0,
      startDate: now,
      endDate: now + 2 * oneDay,
      maxParticipants: 32,
      currentParticipants: 15,
      status: "active",
      participants: [],
      matches: [],
    },
    {
      id: "beginner_friendly",
      name: "Beginner Friendly Cup",
      description: "New to chess? This tournament is for you! 12 hours left.",
      entryFee: 0.01,
      prizePool: 0.2,
      startDate: now - 12 * oneHour,
      endDate: now + 12 * oneHour,
      maxParticipants: 8,
      currentParticipants: 5,
      status: "active",
      participants: [],
      matches: [],
    },
    {
      id: "flash_tournament",
      name: "Flash Tournament",
      description: "Quick 6-hour tournament starting soon!",
      entryFee: 0.015,
      prizePool: 0.3,
      startDate: now + oneHour,
      endDate: now + 7 * oneHour,
      maxParticipants: 16,
      currentParticipants: 0,
      status: "upcoming",
      participants: [],
      matches: [],
    },
    {
      id: "grand_championship",
      name: "Grand Championship",
      description: "Monthly championship with massive prize pool. 3 days remaining!",
      entryFee: 0.1,
      prizePool: 5.0,
      startDate: now,
      endDate: now + 3 * oneDay,
      maxParticipants: 64,
      currentParticipants: 42,
      status: "active",
      participants: [],
      matches: [],
    },
  ]
}

export function joinTournament(tournamentId: string, playerAddress: string, playerRating: number): boolean {
  const tournaments = getAllTournaments()
  const tournament = tournaments.find((t) => t.id === tournamentId)

  if (!tournament) return false
  if (tournament.currentParticipants >= tournament.maxParticipants) return false
  if (tournament.participants.find((p) => p.address === playerAddress)) return false

  tournament.participants.push({
    address: playerAddress,
    joinedAt: Date.now(),
    rating: playerRating,
    wins: 0,
    losses: 0,
    draws: 0,
  })
  tournament.currentParticipants++

  localStorage.setItem("chess_tournaments", JSON.stringify(tournaments))
  return true
}

export function isPlayerInTournament(tournamentId: string, playerAddress: string): boolean {
  const tournaments = getAllTournaments()
  const tournament = tournaments.find((t) => t.id === tournamentId)
  if (!tournament) return false
  return tournament.participants.some((p) => p.address.toLowerCase() === playerAddress.toLowerCase())
}

export function getTimeRemaining(endDate: number): string {
  const now = Date.now()
  const diff = endDate - now

  if (diff <= 0) return "Ended"

  const days = Math.floor(diff / (24 * 60 * 60 * 1000))
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000))

  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}
