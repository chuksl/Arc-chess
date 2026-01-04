// Chess engine types and logic

export type PieceType = "king" | "queen" | "rook" | "bishop" | "knight" | "pawn"
export type PieceColor = "white" | "black"
export type File = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h"
export type Rank = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8"
export type Square = `${File}${Rank}`

export interface Piece {
  type: PieceType
  color: PieceColor
  hasMoved?: boolean // Track if piece has moved for castling and pawn double move
}

export interface Position {
  [square: string]: Piece | null
}

export interface Move {
  from: Square
  to: Square
  piece: Piece
  captured?: Piece
  isEnPassant?: boolean // Track en passant captures
  isCastling?: boolean // Track castling moves
  isPromotion?: boolean // Track pawn promotions
  promotedTo?: PieceType // Track what piece pawn promoted to
}

export interface ChessGame {
  position: Position
  currentPlayer: PieceColor
  moveHistory: Move[]
  halfMoveClock: number
  fullMoveNumber: number
  gameStatus?: "active" | "checkmate" | "stalemate" | "draw"
  winner?: PieceColor
  enPassantSquare?: Square | null // Track en passant target square
  drawReason?: string // Track draw reason
}

// Initialize a new chess game with standard starting position
export function createGame(): ChessGame {
  const position: Position = {}

  // Initialize empty squares
  for (let rank = 1; rank <= 8; rank++) {
    for (let file = 97; file <= 104; file++) {
      const square = `${String.fromCharCode(file)}${rank}` as Square
      position[square] = null
    }
  }

  // Set up white pieces
  position["a1"] = { type: "rook", color: "white", hasMoved: false }
  position["b1"] = { type: "knight", color: "white" }
  position["c1"] = { type: "bishop", color: "white" }
  position["d1"] = { type: "queen", color: "white" }
  position["e1"] = { type: "king", color: "white", hasMoved: false }
  position["f1"] = { type: "bishop", color: "white" }
  position["g1"] = { type: "knight", color: "white" }
  position["h1"] = { type: "rook", color: "white", hasMoved: false }

  for (let file = 97; file <= 104; file++) {
    const square = `${String.fromCharCode(file)}2` as Square
    position[square] = { type: "pawn", color: "white" }
  }

  // Set up black pieces
  position["a8"] = { type: "rook", color: "black", hasMoved: false }
  position["b8"] = { type: "knight", color: "black" }
  position["c8"] = { type: "bishop", color: "black" }
  position["d8"] = { type: "queen", color: "black" }
  position["e8"] = { type: "king", color: "black", hasMoved: false }
  position["f8"] = { type: "bishop", color: "black" }
  position["g8"] = { type: "knight", color: "black" }
  position["h8"] = { type: "rook", color: "black", hasMoved: false }

  for (let file = 97; file <= 104; file++) {
    const square = `${String.fromCharCode(file)}7` as Square
    position[square] = { type: "pawn", color: "black" }
  }

  return {
    position,
    currentPlayer: "white",
    moveHistory: [],
    halfMoveClock: 0,
    fullMoveNumber: 1,
    gameStatus: "active",
    enPassantSquare: null,
  }
}

export function getBoardPosition(game: ChessGame): Position {
  return game.position
}

export function findKing(position: Position, color: PieceColor): Square | null {
  for (const square in position) {
    const piece = position[square]
    if (piece && piece.type === "king" && piece.color === color) {
      return square as Square
    }
  }
  return null
}

export function isSquareUnderAttack(position: Position, square: Square, attackingColor: PieceColor): boolean {
  const [targetFile, targetRank] = [square.charCodeAt(0) - 97, Number.parseInt(square[1]) - 1]

  for (const fromSquare in position) {
    const piece = position[fromSquare]
    if (!piece || piece.color !== attackingColor) continue

    const [file, rank] = [fromSquare.charCodeAt(0) - 97, Number.parseInt(fromSquare[1]) - 1]

    switch (piece.type) {
      case "pawn": {
        const direction = piece.color === "white" ? 1 : -1
        const attackRank = rank + direction
        if (attackRank === targetRank && Math.abs(file - targetFile) === 1) {
          return true
        }
        break
      }

      case "knight": {
        const df = Math.abs(file - targetFile)
        const dr = Math.abs(rank - targetRank)
        if ((df === 2 && dr === 1) || (df === 1 && dr === 2)) {
          return true
        }
        break
      }

      case "bishop":
      case "queen": {
        const df = targetFile - file
        const dr = targetRank - rank
        if (Math.abs(df) === Math.abs(dr) && df !== 0) {
          // Check diagonal path
          const dirFile = df > 0 ? 1 : -1
          const dirRank = dr > 0 ? 1 : -1
          let checkFile = file + dirFile
          let checkRank = rank + dirRank

          let pathClear = true
          while (checkFile !== targetFile) {
            const checkSquare = `${String.fromCharCode(checkFile + 97)}${checkRank + 1}` as Square
            if (position[checkSquare]) {
              pathClear = false
              break
            }
            checkFile += dirFile
            checkRank += dirRank
          }

          if (pathClear) return true
        }

        if (piece.type === "bishop") break
        // Queen also checks rook moves
      }

      case "rook": {
        const df = targetFile - file
        const dr = targetRank - rank

        if ((df === 0 && dr !== 0) || (df !== 0 && dr === 0)) {
          // Check straight path
          const dirFile = df === 0 ? 0 : df > 0 ? 1 : -1
          const dirRank = dr === 0 ? 0 : dr > 0 ? 1 : -1
          let checkFile = file + dirFile
          let checkRank = rank + dirRank

          let pathClear = true
          while (checkFile !== targetFile || checkRank !== targetRank) {
            const checkSquare = `${String.fromCharCode(checkFile + 97)}${checkRank + 1}` as Square
            if (position[checkSquare]) {
              pathClear = false
              break
            }
            checkFile += dirFile
            checkRank += dirRank
          }

          if (pathClear) return true
        }
        break
      }

      case "king": {
        const df = Math.abs(file - targetFile)
        const dr = Math.abs(rank - targetRank)
        if (df <= 1 && dr <= 1) {
          return true
        }
        break
      }
    }
  }

  return false
}

export function isMoveLegal(game: ChessGame, from: Square, to: Square): boolean {
  const piece = game.position[from]
  if (!piece) return false

  // Simulate the move
  const newPosition = { ...game.position }
  newPosition[to] = piece
  newPosition[from] = null

  // Find king position after the move
  const kingSquare = piece.type === "king" ? to : findKing(newPosition, piece.color)
  if (!kingSquare) return false

  // Check if king is under attack
  const opponentColor = piece.color === "white" ? "black" : "white"
  return !isSquareUnderAttack(newPosition, kingSquare, opponentColor)
}

export function getPossibleMoves(game: ChessGame, square: Square): Square[] {
  const piece = game.position[square]
  if (!piece || piece.color !== game.currentPlayer) {
    return []
  }

  const moves: Square[] = []
  const [file, rank] = [square.charCodeAt(0) - 97, Number.parseInt(square[1]) - 1]

  switch (piece.type) {
    case "pawn": {
      const direction = piece.color === "white" ? 1 : -1
      const newRank = rank + direction

      if (newRank >= 0 && newRank < 8) {
        const forward = `${String.fromCharCode(file + 97)}${newRank + 1}` as Square
        if (!game.position[forward]) {
          moves.push(forward)

          // Double move from starting position
          const startRank = piece.color === "white" ? 1 : 6
          if (rank === startRank) {
            const doubleForward = `${String.fromCharCode(file + 97)}${newRank + direction + 1}` as Square
            if (!game.position[doubleForward]) {
              moves.push(doubleForward)
            }
          }
        }

        // Regular captures
        for (const captureFile of [file - 1, file + 1]) {
          if (captureFile >= 0 && captureFile < 8) {
            const captureSquare = `${String.fromCharCode(captureFile + 97)}${newRank + 1}` as Square
            const target = game.position[captureSquare]
            if (target && target.color !== piece.color) {
              moves.push(captureSquare)
            }

            if (game.enPassantSquare === captureSquare) {
              moves.push(captureSquare)
            }
          }
        }
      }
      break
    }

    case "knight": {
      const knightMoves = [
        [2, 1],
        [2, -1],
        [-2, 1],
        [-2, -1],
        [1, 2],
        [1, -2],
        [-1, 2],
        [-1, -2],
      ]

      for (const [df, dr] of knightMoves) {
        const newFile = file + df
        const newRank = rank + dr

        if (newFile >= 0 && newFile < 8 && newRank >= 0 && newRank < 8) {
          const targetSquare = `${String.fromCharCode(newFile + 97)}${newRank + 1}` as Square
          const target = game.position[targetSquare]
          if (!target || target.color !== piece.color) {
            moves.push(targetSquare)
          }
        }
      }
      break
    }

    case "rook":
    case "queen": {
      const directions = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]

      for (const [df, dr] of directions) {
        let newFile = file + df
        let newRank = rank + dr

        while (newFile >= 0 && newFile < 8 && newRank >= 0 && newRank < 8) {
          const targetSquare = `${String.fromCharCode(newFile + 97)}${newRank + 1}` as Square
          const target = game.position[targetSquare]

          if (!target) {
            moves.push(targetSquare)
          } else {
            if (target.color !== piece.color) {
              moves.push(targetSquare)
            }
            break
          }

          newFile += df
          newRank += dr
        }
      }

      if (piece.type === "queen") {
        const diagonals = [
          [1, 1],
          [1, -1],
          [-1, 1],
          [-1, -1],
        ]

        for (const [df, dr] of diagonals) {
          let newFile = file + df
          let newRank = rank + dr

          while (newFile >= 0 && newFile < 8 && newRank >= 0 && newRank < 8) {
            const targetSquare = `${String.fromCharCode(newFile + 97)}${newRank + 1}` as Square
            const target = game.position[targetSquare]

            if (!target) {
              moves.push(targetSquare)
            } else {
              if (target.color !== piece.color) {
                moves.push(targetSquare)
              }
              break
            }

            newFile += df
            newRank += dr
          }
        }
      }
      break
    }

    case "bishop": {
      const directions = [
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ]

      for (const [df, dr] of directions) {
        let newFile = file + df
        let newRank = rank + dr

        while (newFile >= 0 && newFile < 8 && newRank >= 0 && newRank < 8) {
          const targetSquare = `${String.fromCharCode(newFile + 97)}${newRank + 1}` as Square
          const target = game.position[targetSquare]

          if (!target) {
            moves.push(targetSquare)
          } else {
            if (target.color !== piece.color) {
              moves.push(targetSquare)
            }
            break
          }

          newFile += df
          newRank += dr
        }
      }
      break
    }

    case "king": {
      const kingMoves = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ]

      for (const [df, dr] of kingMoves) {
        const newFile = file + df
        const newRank = rank + dr

        if (newFile >= 0 && newFile < 8 && newRank >= 0 && newRank < 8) {
          const targetSquare = `${String.fromCharCode(newFile + 97)}${newRank + 1}` as Square
          const target = game.position[targetSquare]
          if (!target || target.color !== piece.color) {
            moves.push(targetSquare)
          }
        }
      }

      if (!piece.hasMoved) {
        const baseRank = piece.color === "white" ? "1" : "8"

        // Kingside castling
        const kingsideRook = game.position[`h${baseRank}` as Square]
        if (
          kingsideRook &&
          kingsideRook.type === "rook" &&
          kingsideRook.color === piece.color &&
          !kingsideRook.hasMoved &&
          !game.position[`f${baseRank}` as Square] &&
          !game.position[`g${baseRank}` as Square]
        ) {
          // Check if king passes through or ends in check
          const opponentColor = piece.color === "white" ? "black" : "white"
          const kingSquare = square
          const passSquare = `f${baseRank}` as Square
          const endSquare = `g${baseRank}` as Square

          if (
            !isSquareUnderAttack(game.position, kingSquare, opponentColor) &&
            !isSquareUnderAttack(game.position, passSquare, opponentColor) &&
            !isSquareUnderAttack(game.position, endSquare, opponentColor)
          ) {
            moves.push(endSquare)
          }
        }

        // Queenside castling
        const queensideRook = game.position[`a${baseRank}` as Square]
        if (
          queensideRook &&
          queensideRook.type === "rook" &&
          queensideRook.color === piece.color &&
          !queensideRook.hasMoved &&
          !game.position[`b${baseRank}` as Square] &&
          !game.position[`c${baseRank}` as Square] &&
          !game.position[`d${baseRank}` as Square]
        ) {
          const opponentColor = piece.color === "white" ? "black" : "white"
          const kingSquare = square
          const passSquare = `d${baseRank}` as Square
          const endSquare = `c${baseRank}` as Square

          if (
            !isSquareUnderAttack(game.position, kingSquare, opponentColor) &&
            !isSquareUnderAttack(game.position, passSquare, opponentColor) &&
            !isSquareUnderAttack(game.position, endSquare, opponentColor)
          ) {
            moves.push(endSquare)
          }
        }
      }
      break
    }
  }

  return moves.filter((move) => isMoveLegal(game, square, move))
}

export function isInCheck(game: ChessGame): boolean {
  const kingSquare = findKing(game.position, game.currentPlayer)
  if (!kingSquare) return false

  const opponentColor = game.currentPlayer === "white" ? "black" : "white"
  return isSquareUnderAttack(game.position, kingSquare, opponentColor)
}

export function getAllLegalMoves(game: ChessGame): Array<{ from: Square; to: Square }> {
  const legalMoves: Array<{ from: Square; to: Square }> = []

  for (const square in game.position) {
    const piece = game.position[square]
    if (piece && piece.color === game.currentPlayer) {
      const moves = getPossibleMoves(game, square as Square)
      for (const to of moves) {
        legalMoves.push({ from: square as Square, to })
      }
    }
  }

  return legalMoves
}

export function hasInsufficientMaterial(position: Position): boolean {
  const pieces: Piece[] = []

  for (const square in position) {
    const piece = position[square]
    if (piece) pieces.push(piece)
  }

  // King vs King
  if (pieces.length === 2) return true

  // King + Bishop/Knight vs King
  if (pieces.length === 3) {
    const hasOnlyMinorPiece = pieces.some((p) => p.type === "bishop" || p.type === "knight")
    return hasOnlyMinorPiece
  }

  // King + Bishop vs King + Bishop (same color squares)
  if (pieces.length === 4) {
    const bishops = pieces.filter((p) => p.type === "bishop")
    if (bishops.length === 2) {
      // Find bishop squares to check if they're on same color
      const bishopSquares: Square[] = []
      for (const square in position) {
        const piece = position[square]
        if (piece && piece.type === "bishop") {
          bishopSquares.push(square as Square)
        }
      }

      if (bishopSquares.length === 2) {
        const [sq1, sq2] = bishopSquares
        const color1 = (sq1.charCodeAt(0) + Number.parseInt(sq1[1])) % 2
        const color2 = (sq2.charCodeAt(0) + Number.parseInt(sq2[1])) % 2
        return color1 === color2
      }
    }
  }

  return false
}

export function hasThreefoldRepetition(game: ChessGame): boolean {
  const currentPosition = positionToString(game.position)
  const positions = [currentPosition]

  // Build position history from move history
  let tempGame = createGame()
  for (const move of game.moveHistory.slice(0, -1)) {
    tempGame = makeMove(tempGame, move.from, move.to, move.promotedTo)
    positions.push(positionToString(tempGame.position))
  }

  // Count occurrences of current position
  const count = positions.filter((pos) => pos === currentPosition).length
  return count >= 3
}

function positionToString(position: Position): string {
  const squares: string[] = []
  for (let rank = 8; rank >= 1; rank--) {
    for (let file = 97; file <= 104; file++) {
      const square = `${String.fromCharCode(file)}${rank}` as Square
      const piece = position[square]
      if (piece) {
        squares.push(`${square}:${piece.color[0]}${piece.type[0]}`)
      }
    }
  }
  return squares.join(",")
}

export function makeMove(game: ChessGame, from: Square, to: Square, promotionPiece?: PieceType): ChessGame {
  const piece = game.position[from]
  if (!piece) return game

  const captured = game.position[to]
  const newPosition = { ...game.position }

  let isEnPassant = false
  if (piece.type === "pawn" && to === game.enPassantSquare && !captured) {
    isEnPassant = true
    const captureRank = piece.color === "white" ? "5" : "4"
    const captureFile = to[0]
    const captureSquare = `${captureFile}${captureRank}` as Square
    newPosition[captureSquare] = null
  }

  let isCastling = false
  if (piece.type === "king" && Math.abs(from.charCodeAt(0) - to.charCodeAt(0)) === 2) {
    isCastling = true
    const isKingside = to.charCodeAt(0) > from.charCodeAt(0)
    const rank = piece.color === "white" ? "1" : "8"

    if (isKingside) {
      const rook = newPosition[`h${rank}` as Square]
      newPosition[`f${rank}` as Square] = rook ? { ...rook, hasMoved: true } : null
      newPosition[`h${rank}` as Square] = null
    } else {
      const rook = newPosition[`a${rank}` as Square]
      newPosition[`d${rank}` as Square] = rook ? { ...rook, hasMoved: true } : null
      newPosition[`a${rank}` as Square] = null
    }
  }

  let isPromotion = false
  let promotedTo: PieceType | undefined
  const promotionRank = piece.color === "white" ? "8" : "1"
  if (piece.type === "pawn" && to[1] === promotionRank) {
    isPromotion = true
    promotedTo = promotionPiece || "queen"
    newPosition[to] = { type: promotedTo, color: piece.color, hasMoved: true }
  } else {
    newPosition[to] = { ...piece, hasMoved: true }
  }

  newPosition[from] = null

  let newEnPassantSquare: Square | null = null
  if (piece.type === "pawn" && Math.abs(Number.parseInt(to[1]) - Number.parseInt(from[1])) === 2) {
    const enPassantRank = piece.color === "white" ? "3" : "6"
    newEnPassantSquare = `${to[0]}${enPassantRank}` as Square
  }

  const move: Move = {
    from,
    to,
    piece,
    captured: captured || undefined,
    isEnPassant,
    isCastling,
    isPromotion,
    promotedTo,
  }

  const nextPlayer = game.currentPlayer === "white" ? "black" : "white"

  const newGame: ChessGame = {
    ...game,
    position: newPosition,
    currentPlayer: nextPlayer,
    moveHistory: [...game.moveHistory, move],
    halfMoveClock: captured || piece.type === "pawn" ? 0 : game.halfMoveClock + 1,
    fullMoveNumber: game.currentPlayer === "black" ? game.fullMoveNumber + 1 : game.fullMoveNumber,
    gameStatus: "active",
    enPassantSquare: newEnPassantSquare,
  }

  if (newGame.halfMoveClock >= 100) {
    newGame.gameStatus = "draw"
    newGame.drawReason = "50-move rule"
    return newGame
  }

  if (hasInsufficientMaterial(newGame.position)) {
    newGame.gameStatus = "draw"
    newGame.drawReason = "Insufficient material"
    return newGame
  }

  if (hasThreefoldRepetition(newGame)) {
    newGame.gameStatus = "draw"
    newGame.drawReason = "Threefold repetition"
    return newGame
  }

  const legalMoves = getAllLegalMoves(newGame)
  const inCheck = isInCheck(newGame)

  if (legalMoves.length === 0) {
    if (inCheck) {
      newGame.gameStatus = "checkmate"
      newGame.winner = game.currentPlayer
    } else {
      newGame.gameStatus = "stalemate"
    }
  }

  return newGame
}

export function isGameOver(game: ChessGame): boolean {
  return game.gameStatus === "checkmate" || game.gameStatus === "stalemate" || game.gameStatus === "draw"
}

export function getGameResult(game: ChessGame): string {
  if (game.gameStatus === "checkmate") {
    return `Checkmate! ${game.winner === "white" ? "White" : "Black"} wins!`
  }
  if (game.gameStatus === "stalemate") {
    return "Stalemate! Game is a draw."
  }
  if (game.gameStatus === "draw") {
    return `Draw by ${game.drawReason || "agreement"}.`
  }
  return ""
}

export function requiresPromotion(game: ChessGame, from: Square, to: Square): boolean {
  const piece = game.position[from]
  if (!piece || piece.type !== "pawn") return false

  const promotionRank = piece.color === "white" ? "8" : "1"
  return to[1] === promotionRank
}
