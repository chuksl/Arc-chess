import type { ChessGame, Square, Piece } from "./chess-engine"
import { getPossibleMoves, makeMove, getBoardPosition } from "./chess-engine"
import { Baby, UserRound, GraduationCap, Sword, Crown, Trophy } from "lucide-react"

export type AIDifficulty = "beginner" | "intermediate" | "advanced" | "expert" | "master" | "grandmaster"

export const difficultyConfig = {
  beginner: {
    name: "Beginner",
    icon: Baby,
    eloRating: 800,
    description: "Learn the basics with an easy opponent",
  },
  intermediate: {
    name: "Intermediate",
    icon: UserRound,
    eloRating: 1200,
    description: "Practice your skills against a moderate challenge",
  },
  advanced: {
    name: "Advanced",
    icon: GraduationCap,
    eloRating: 1600,
    description: "Face a tactical and strategic opponent",
  },
  expert: {
    name: "Expert",
    icon: Sword,
    eloRating: 2000,
    description: "Challenge yourself against strong play",
  },
  master: {
    name: "Master",
    icon: Crown,
    eloRating: 2400,
    description: "Test your skills against near-perfect play",
  },
  grandmaster: {
    name: "Grandmaster",
    icon: Trophy,
    eloRating: 2800,
    description: "The ultimate chess challenge",
  },
} as const

interface EvaluatedMove {
  from: Square
  to: Square
  score: number
}

const PIECE_VALUES: Record<Piece["type"], number> = {
  pawn: 1,
  knight: 3,
  bishop: 3,
  rook: 5,
  queen: 9,
  king: 100,
}

// Evaluate the current board position
function evaluatePosition(game: ChessGame, forColor: "white" | "black"): number {
  const position = getBoardPosition(game)
  let score = 0

  // Material evaluation
  for (const square in position) {
    const piece = position[square]
    if (piece) {
      const value = PIECE_VALUES[piece.type]
      if (piece.color === forColor) {
        score += value
      } else {
        score -= value
      }
    }
  }

  // Positional bonuses
  for (const square in position) {
    const piece = position[square]
    if (piece && piece.color === forColor) {
      const [file, rank] = [square.charCodeAt(0) - 97, Number.parseInt(square[1]) - 1]

      // Center control bonus
      if (file >= 2 && file <= 5 && rank >= 2 && rank <= 5) {
        score += 0.3
      }

      // Pawn advancement bonus
      if (piece.type === "pawn") {
        const advancement = piece.color === "white" ? rank : 7 - rank
        score += advancement * 0.1
      }
    }
  }

  return score
}

// Get all legal moves for the current player
function getAllLegalMoves(game: ChessGame): EvaluatedMove[] {
  const position = getBoardPosition(game)
  const moves: EvaluatedMove[] = []

  for (const square in position) {
    const piece = position[square]
    if (piece && piece.color === game.currentPlayer) {
      const possibleMoves = getPossibleMoves(game, square as Square)
      for (const to of possibleMoves) {
        moves.push({
          from: square as Square,
          to,
          score: 0,
        })
      }
    }
  }

  return moves
}

function orderMoves(game: ChessGame, moves: EvaluatedMove[]): EvaluatedMove[] {
  // Quick evaluation for move ordering (captures first)
  for (const move of moves) {
    const targetPiece = game.position[move.to]
    if (targetPiece) {
      move.score = PIECE_VALUES[targetPiece.type] * 1000 // High priority for captures
    } else {
      move.score = 0
    }
  }
  return moves.sort((a, b) => b.score - a.score)
}

function minimax(
  game: ChessGame,
  depth: number,
  alpha: number,
  beta: number,
  maximizingPlayer: boolean,
  aiColor: "white" | "black",
): number {
  if (depth === 0) {
    return evaluatePosition(game, aiColor)
  }

  let moves = getAllLegalMoves(game)

  if (moves.length === 0) {
    return evaluatePosition(game, aiColor)
  }

  moves = orderMoves(game, moves)

  if (maximizingPlayer) {
    let maxEval = Number.NEGATIVE_INFINITY
    for (const move of moves) {
      const newGame = makeMove(game, move.from, move.to, "queen")
      const evaluation = minimax(newGame, depth - 1, alpha, beta, false, aiColor)
      maxEval = Math.max(maxEval, evaluation)
      alpha = Math.max(alpha, evaluation)
      if (beta <= alpha) {
        break // Beta cutoff
      }
    }
    return maxEval
  } else {
    let minEval = Number.POSITIVE_INFINITY
    for (const move of moves) {
      const newGame = makeMove(game, move.from, move.to, "queen")
      const evaluation = minimax(newGame, depth - 1, alpha, beta, true, aiColor)
      minEval = Math.min(minEval, evaluation)
      beta = Math.min(beta, evaluation)
      if (beta <= alpha) {
        break // Alpha cutoff
      }
    }
    return minEval
  }
}

// Make a random move (for beginner difficulty)
function makeRandomMove(game: ChessGame): { from: Square; to: Square } | null {
  const moves = getAllLegalMoves(game)
  if (moves.length === 0) return null
  return moves[Math.floor(Math.random() * moves.length)]
}

// Make a greedy move (capture highest value piece, for intermediate difficulty)
function makeGreedyMove(game: ChessGame): { from: Square; to: Square } | null {
  const moves = getAllLegalMoves(game)
  if (moves.length === 0) return null

  for (const move of moves) {
    const targetPiece = game.position[move.to]
    move.score = targetPiece ? PIECE_VALUES[targetPiece.type] : Math.random() * 0.5
  }

  moves.sort((a, b) => b.score - a.score)
  const topMoves = moves.slice(0, Math.min(3, moves.length))
  return topMoves[Math.floor(Math.random() * topMoves.length)]
}

// Make a tactical move (for advanced difficulty)
function makeTacticalMove(game: ChessGame, randomness: number): { from: Square; to: Square } | null {
  const moves = getAllLegalMoves(game)
  if (moves.length === 0) return null

  for (const move of moves) {
    const targetPiece = game.position[move.to]
    let score = 0

    // Material gain
    if (targetPiece) {
      score += PIECE_VALUES[targetPiece.type] * 10
    }

    // Center control
    const [file, rank] = [move.to.charCodeAt(0) - 97, Number.parseInt(move.to[1]) - 1]
    if (file >= 2 && file <= 5 && rank >= 2 && rank <= 5) {
      score += 2
    }

    // Piece development (moving from starting positions)
    const piece = game.position[move.from]
    if (piece) {
      const startRank = piece.color === "white" ? 1 : 6
      const fromRank = Number.parseInt(move.from[1]) - 1
      if (fromRank === startRank && piece.type !== "pawn") {
        score += 1
      }
    }

    // Add randomness factor
    score += Math.random() * randomness

    move.score = score
  }

  moves.sort((a, b) => b.score - a.score)
  const topCount = Math.max(1, Math.floor(moves.length * 0.2))
  const topMoves = moves.slice(0, topCount)
  return topMoves[Math.floor(Math.random() * topMoves.length)]
}

let aiWorker: Worker | null = null

function getOrCreateWorker(): Worker {
  if (!aiWorker) {
    aiWorker = new Worker(new URL("./chess-ai-worker.ts", import.meta.url), { type: "module" })
  }
  return aiWorker
}

async function makeStrategicMoveWithWorker(
  game: ChessGame,
  difficulty: AIDifficulty,
  timeControl?: { minutes: number; increment: number },
): Promise<{ from: Square; to: Square } | null> {
  return new Promise((resolve) => {
    const worker = getOrCreateWorker()

    let maxTimeMap: Record<AIDifficulty, number> = {
      beginner: 150,
      intermediate: 250,
      advanced: 400,
      expert: 600,
      master: 800,
      grandmaster: 1000,
    }

    const isBlitz = timeControl && timeControl.minutes <= 3
    if (isBlitz) {
      maxTimeMap = {
        beginner: 100,
        intermediate: 150,
        advanced: 250,
        expert: 350,
        master: 450,
        grandmaster: 500, // Fast response with depth 4 + advanced evaluation = Carlsen-level
      }
    }

    const maxTime = maxTimeMap[difficulty]

    const timeout = setTimeout(() => {
      console.log("[v0] AI calculation timeout, using fallback")
      resolve(makeGreedyMove(game))
    }, maxTime + 500)

    worker.onmessage = (e) => {
      clearTimeout(timeout)
      resolve(e.data.move)
    }

    worker.postMessage({
      type: "calculate",
      game,
      difficulty,
      maxTime,
      isBlitz,
    })
  })
}

// Get difficulty settings
function getDifficultySettings(difficulty: AIDifficulty) {
  const settings = {
    beginner: { depth: 1, strategy: "random", thinkTime: 200, randomness: 1.0 },
    intermediate: { depth: 2, strategy: "greedy", thinkTime: 300, randomness: 0.5 },
    advanced: { depth: 2, strategy: "tactical", thinkTime: 400, randomness: 0.3 },
    expert: { depth: 3, strategy: "positional", thinkTime: 600, randomness: 0.1 },
    master: { depth: 3, strategy: "strategic", thinkTime: 800, randomness: 0.05 },
    grandmaster: { depth: 3, strategy: "optimal", thinkTime: 1000, randomness: 0 },
  }
  return settings[difficulty]
}

// Make a strategic move (for expert, master, and grandmaster difficulties)
async function makeStrategicMove(
  game: ChessGame,
  difficulty: AIDifficulty,
  timeControl?: { minutes: number; increment: number },
): Promise<{ from: Square; to: Square } | null> {
  const settings = getDifficultySettings(difficulty)
  const aiColor = game.currentPlayer

  let moves = getAllLegalMoves(game)
  if (moves.length === 0) return null

  moves = orderMoves(game, moves)

  if (settings.depth >= 3 && moves.length > 15) {
    moves = moves.slice(0, 15)
  }

  // Evaluate each move with deep search
  for (const move of moves) {
    const newGame = makeMove(game, move.from, move.to, "queen")
    move.score = minimax(
      newGame,
      settings.depth - 1,
      Number.NEGATIVE_INFINITY,
      Number.POSITIVE_INFINITY,
      false,
      aiColor,
    )

    // Add minimal randomness for variety (except grandmaster)
    if (settings.randomness > 0) {
      move.score += (Math.random() - 0.5) * settings.randomness
    }
  }

  moves.sort((a, b) => b.score - a.score)
  return moves[0]
}

// Get AI move based on difficulty
export async function getAIMove(
  game: ChessGame,
  difficulty: AIDifficulty,
  timeControl?: { minutes: number; increment: number },
): Promise<{ from: Square; to: Square } | null> {
  console.log(`[v0] AI calculating move for ${difficulty} difficulty`)

  switch (difficulty) {
    case "beginner":
      return makeRandomMove(game)
    case "intermediate":
      return makeGreedyMove(game)
    case "advanced":
    case "expert":
    case "master":
    case "grandmaster":
      // Use Web Worker for advanced difficulties
      return makeStrategicMoveWithWorker(game, difficulty, timeControl)
  }
}

// Simulate AI thinking time based on difficulty
export function simulateAIThinking(difficulty: AIDifficulty): Promise<void> {
  const thinkTimeMap: Record<AIDifficulty, number> = {
    beginner: 150,
    intermediate: 250,
    advanced: 400,
    expert: 500,
    master: 600,
    grandmaster: 700,
  }

  return new Promise((resolve) => {
    setTimeout(resolve, thinkTimeMap[difficulty])
  })
}
