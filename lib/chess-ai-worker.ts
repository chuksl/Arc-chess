// Web Worker for chess AI calculations
// This runs in a separate thread to prevent UI blocking

import type { ChessGame, Square, Piece } from "./chess-engine"
import { getPossibleMoves, makeMove, getBoardPosition } from "./chess-engine"

interface WorkerMessage {
  type: "calculate"
  game: ChessGame
  difficulty: string
  maxTime: number
  isBlitz?: boolean
}

interface WorkerResponse {
  type: "result"
  move: { from: Square; to: Square } | null
}

const PIECE_VALUES: Record<Piece["type"], number> = {
  pawn: 100,
  knight: 320,
  bishop: 330,
  rook: 500,
  queen: 900,
  king: 20000,
}

const PAWN_TABLE = [
  0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 50, 50, 50, 50, 10, 10, 20, 30, 30, 20, 10, 10, 5, 5, 10, 25, 25, 10, 5, 5, 0,
  0, 0, 20, 20, 0, 0, 0, 5, -5, -10, 0, 0, -10, -5, 5, 5, 10, 10, -20, -20, 10, 10, 5, 0, 0, 0, 0, 0, 0, 0, 0,
]

const KNIGHT_TABLE = [
  -50, -40, -30, -30, -30, -30, -40, -50, -40, -20, 0, 0, 0, 0, -20, -40, -30, 0, 10, 15, 15, 10, 0, -30, -30, 5, 15,
  20, 20, 15, 5, -30, -30, 0, 15, 20, 20, 15, 0, -20, -40, -50, -40, -30, -30, -30, -30, -40, -50,
]

const BISHOP_TABLE = [
  -20, -10, -10, -10, -10, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5, 10, 10, 5, 0, -10, -10, 5, 5, 10, 10,
  5, 5, -10, -10, 0, 10, 10, 10, 10, 0, -10, -10, 10, 10, 10, 10, 10, 10, -10, -10, 5, 0, 0, 0, 0, 5, -10, -20, -10,
  -10, -10, -10, -10, -10, -20,
]

const ROOK_TABLE = [
  0, 0, 0, 0, 0, 0, 0, 0, 5, 10, 10, 10, 10, 10, 10, 5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0,
  0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, 0, 0, 0, 5, 5, 0, 0, 0,
]

const QUEEN_TABLE = [
  -20, -10, -10, -5, -5, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5, 5, 5, 5, 0, -10, -5, 0, 5, 5, 5, 5, 0,
  -5, 0, 0, 5, 5, 5, 5, 0, -5, -10, 5, 5, 5, 5, 5, 0, -10, -10, 0, 5, 0, 0, 0, 0, -10, -20, -10, -10, -5, -5, -10, -10,
  -20,
]

const KING_MIDDLE_TABLE = [
  -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40,
  -30, -30, -40, -40, -50, -50, -40, -40, -30, -20, -30, -30, -40, -40, -30, -30, -20, -10, -20, -20, -20, -20, -20,
  -20, -10, 20, 20, 0, 0, 0, 0, 20, 20, 20, 30, 10, 0, 0, 10, 30, 20,
]

const KING_END_TABLE = [
  -50, -40, -30, -20, -20, -30, -40, -50, -30, -20, -10, 0, 0, -10, -20, -30, -30, -10, 20, 30, 30, 20, -10, -30, -30,
  -10, 30, 40, 40, 30, -10, -30, -30, -10, 30, 40, 40, 30, -10, -30, -30, -10, 20, 30, 30, 20, -10, -30, -30, -30, 0, 0,
  0, 0, -30, -30, -50, -30, -30, -30, -30, -30, -30, -50,
]

function getPieceSquareValue(piece: Piece, square: string, isEndgame: boolean): number {
  const file = square.charCodeAt(0) - 97
  const rank = Number.parseInt(square[1]) - 1
  const index = piece.color === "white" ? rank * 8 + file : (7 - rank) * 8 + file

  switch (piece.type) {
    case "pawn":
      return PAWN_TABLE[index]
    case "knight":
      return KNIGHT_TABLE[index]
    case "bishop":
      return BISHOP_TABLE[index]
    case "rook":
      return ROOK_TABLE[index]
    case "queen":
      return QUEEN_TABLE[index]
    case "king":
      return isEndgame ? KING_END_TABLE[index] : KING_MIDDLE_TABLE[index]
    default:
      return 0
  }
}

function evaluatePosition(game: ChessGame, forColor: "white" | "black"): number {
  const position = getBoardPosition(game)
  let score = 0
  let whiteMaterial = 0
  let blackMaterial = 0

  // Material evaluation and piece-square table values
  for (const square in position) {
    const piece = position[square]
    if (piece && piece.type !== "king") {
      const materialValue = PIECE_VALUES[piece.type]
      whiteMaterial += piece.color === "white" ? materialValue : 0
      blackMaterial += piece.color === "black" ? materialValue : 0
    }
  }

  const isEndgame = whiteMaterial + blackMaterial < 2500

  for (const square in position) {
    const piece = position[square]
    if (piece) {
      const materialValue = PIECE_VALUES[piece.type]
      const positionalValue = getPieceSquareValue(piece, square, isEndgame)
      const totalValue = materialValue + positionalValue

      score += piece.color === forColor ? totalValue : -totalValue
    }
  }

  // Piece mobility scoring
  for (const square in position) {
    const piece = position[square]
    if (piece) {
      const moves = getPossibleMoves(game, square as Square)
      const mobility = moves.length * 5
      score += piece.color === forColor ? mobility : -mobility
    }
  }

  // Pawn structure analysis
  const files: Record<number, { white: number; black: number }> = {}
  for (let i = 0; i < 8; i++) {
    files[i] = { white: 0, black: 0 }
  }

  for (const square in position) {
    const piece = position[square]
    if (piece && piece.type === "pawn") {
      const file = square.charCodeAt(0) - 97
      files[file][piece.color]++
    }
  }

  for (let file = 0; file < 8; file++) {
    const { white, black } = files[file]
    if (white > 1) score += forColor === "white" ? -30 : 30
    if (black > 1) score += forColor === "black" ? -30 : 30
  }

  // King safety in middlegame
  if (!isEndgame) {
    for (const square in position) {
      const piece = position[square]
      if (piece && piece.type === "king") {
        const [file, rank] = [square.charCodeAt(0) - 97, Number.parseInt(square[1]) - 1]
        const isWhiteKing = piece.color === "white"
        const expectedRank = isWhiteKing ? 0 : 7

        if (rank !== expectedRank) {
          const penalty = 60
          score += piece.color === forColor ? -penalty : penalty
        }

        if ((file <= 2 || file >= 6) && rank === expectedRank) {
          const bonus = 40
          score += piece.color === forColor ? bonus : -bonus
        }
      }
    }
  }

  // Bishop pair bonus
  let whiteBishops = 0
  let blackBishops = 0
  for (const square in position) {
    const piece = position[square]
    if (piece && piece.type === "bishop") {
      if (piece.color === "white") whiteBishops++
      else blackBishops++
    }
  }
  if (whiteBishops >= 2) score += forColor === "white" ? 50 : -50
  if (blackBishops >= 2) score += forColor === "black" ? 50 : -50

  return score
}

function getAllLegalMoves(game: ChessGame) {
  const position = getBoardPosition(game)
  const moves: Array<{ from: Square; to: Square; score: number }> = []

  for (const square in position) {
    const piece = position[square]
    if (piece && piece.color === game.currentPlayer) {
      const possibleMoves = getPossibleMoves(game, square as Square)
      for (const to of possibleMoves) {
        const targetPiece = game.position[to]
        let score = 0
        if (targetPiece) {
          score = PIECE_VALUES[targetPiece.type] * 10 - PIECE_VALUES[piece.type] * 0.1
        }
        moves.push({ from: square as Square, to, score })
      }
    }
  }

  return moves.sort((a, b) => b.score - a.score)
}

function quiescence(game: ChessGame, alpha: number, beta: number, aiColor: "white" | "black"): number {
  const standPat = evaluatePosition(game, aiColor)

  if (standPat >= beta) return beta
  if (alpha < standPat) alpha = standPat

  const allMoves = getAllLegalMoves(game)
  const captureMoves = allMoves.filter((move) => game.position[move.to])

  for (const move of captureMoves.slice(0, 20)) {
    const newGame = makeMove(game, move.from, move.to, "queen")
    const score = -quiescence(newGame, -beta, -alpha, aiColor === "white" ? "black" : "white")

    if (score >= beta) return beta
    if (score > alpha) alpha = score
  }

  return alpha
}

function minimax(
  game: ChessGame,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
  aiColor: "white" | "black",
  startTime: number,
  maxTime: number,
): number {
  if (Date.now() - startTime > maxTime) {
    return evaluatePosition(game, aiColor)
  }

  if (depth === 0) {
    return quiescence(game, alpha, beta, aiColor)
  }

  let moves = getAllLegalMoves(game)
  if (moves.length === 0) return evaluatePosition(game, aiColor)

  if (depth >= 4 && moves.length > 15) {
    moves = moves.slice(0, 15)
  } else if (depth >= 3 && moves.length > 20) {
    moves = moves.slice(0, 20)
  } else if (depth >= 2 && moves.length > 30) {
    moves = moves.slice(0, 30)
  }

  if (maximizing) {
    let maxEval = Number.NEGATIVE_INFINITY
    for (const move of moves) {
      const newGame = makeMove(game, move.from, move.to, "queen")
      const evaluation = minimax(newGame, depth - 1, alpha, beta, false, aiColor, startTime, maxTime)
      maxEval = Math.max(maxEval, evaluation)
      alpha = Math.max(alpha, evaluation)
      if (beta <= alpha) break
    }
    return maxEval
  } else {
    let minEval = Number.POSITIVE_INFINITY
    for (const move of moves) {
      const newGame = makeMove(game, move.from, move.to, "queen")
      const evaluation = minimax(newGame, depth - 1, alpha, beta, true, aiColor, startTime, maxTime)
      minEval = Math.min(minEval, evaluation)
      beta = Math.min(beta, evaluation)
      if (beta <= alpha) break
    }
    return minEval
  }
}

const THINKING_TIME: Record<string, Record<string, number>> = {
  beginner: { blitz: 150, rapid: 300, classical: 500, unlimited: 1000 },
  intermediate: { blitz: 200, rapid: 400, classical: 700, unlimited: 1500 },
  advanced: { blitz: 250, rapid: 500, classical: 1000, unlimited: 2000 },
  expert: { blitz: 300, rapid: 700, classical: 1200, unlimited: 2500 },
  master: { blitz: 350, rapid: 900, classical: 1500, unlimited: 3000 },
  grandmaster: { blitz: 250, rapid: 1200, classical: 2000, unlimited: 4000 },
}

function calculateBestMove(game: ChessGame, maxDepth: number, maxTime: number) {
  const aiColor = game.currentPlayer
  const startTime = Date.now()
  let bestMove: { from: Square; to: Square } | null = null
  let bestScore = Number.NEGATIVE_INFINITY

  const moves = getAllLegalMoves(game)
  if (moves.length === 0) return null

  const searchBudget = maxTime * 0.85

  for (let depth = 1; depth <= maxDepth; depth++) {
    if (Date.now() - startTime > searchBudget) break

    let depthBestMove = null
    let depthBestScore = Number.NEGATIVE_INFINITY

    let searchMoves = moves
    if (depth >= 4 && moves.length > 12) {
      searchMoves = moves.slice(0, 12)
    } else if (depth >= 3 && moves.length > 18) {
      searchMoves = moves.slice(0, 18)
    } else if (depth >= 2 && moves.length > 28) {
      searchMoves = moves.slice(0, 28)
    }

    for (const move of searchMoves) {
      if (Date.now() - startTime > searchBudget) break

      const newGame = makeMove(game, move.from, move.to, "queen")
      const score = minimax(
        newGame,
        depth - 1,
        Number.NEGATIVE_INFINITY,
        Number.POSITIVE_INFINITY,
        false,
        aiColor,
        startTime,
        searchBudget,
      )

      if (score > depthBestScore) {
        depthBestScore = score
        depthBestMove = move
      }
    }

    if (depthBestMove) {
      bestMove = depthBestMove
      bestScore = depthBestScore
    }
  }

  return bestMove
}

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  if (e.data.type === "calculate") {
    const { game, difficulty, maxTime, isBlitz } = e.data

    const depthMap: Record<string, Record<string, number>> = {
      beginner: { blitz: 1, rapid: 1, classical: 2, unlimited: 2 },
      intermediate: { blitz: 1, rapid: 2, classical: 2, unlimited: 3 },
      advanced: { blitz: 2, rapid: 2, classical: 3, unlimited: 3 },
      expert: { blitz: 2, rapid: 3, classical: 3, unlimited: 4 },
      master: { blitz: 2, rapid: 3, classical: 4, unlimited: 4 },
      grandmaster: { blitz: 4, rapid: 5, classical: 6, unlimited: 7 },
    }

    const timeControl = isBlitz ? "blitz" : difficulty === "grandmaster" ? "rapid" : "classical"
    const thinkingTime = THINKING_TIME[difficulty]?.[timeControl] || 500
    const depth = depthMap[difficulty]?.[timeControl] || 3

    const move = calculateBestMove(game, depth, thinkingTime)

    const response: WorkerResponse = {
      type: "result",
      move,
    }

    self.postMessage(response)
  }
}
