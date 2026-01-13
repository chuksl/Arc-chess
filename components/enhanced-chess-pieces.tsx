import type { Piece } from "@/lib/chess-engine"

export function getEnhancedPieceSymbol(piece: Piece): string {
  const symbols = {
    white: {
      king: "♔",
      queen: "♕",
      rook: "♖",
      bishop: "♗",
      knight: "♘",
      pawn: "♙",
    },
    black: {
      king: "♚",
      queen: "♛",
      rook: "♜",
      bishop: "♝",
      knight: "♞",
      pawn: "♟",
    },
  }
  return symbols[piece.color][piece.type]
}

export function getPieceStyle(piece: Piece): string {
  const baseStyles = "text-6xl font-bold transition-all duration-200 select-none"

  const colorStyles = {
    // White pieces: Clean, bright, highly visible
    white:
      "text-white [text-shadow:_-1px_-1px_0_#333,_1px_-1px_0_#333,_-1px_1px_0_#333,_1px_1px_0_#333] drop-shadow-md",
    // Black pieces: Dark and distinct with subtle highlight
    black: "text-gray-900 [text-shadow:_1px_1px_0_#ccc,_-1px_-1px_0_#ccc] drop-shadow-sm",
  }

  const hoverStyles = {
    white: "hover:text-gray-100 hover:drop-shadow-lg",
    black: "hover:text-gray-800 hover:drop-shadow-lg",
  }

  return `${baseStyles} ${colorStyles[piece.color]} ${hoverStyles[piece.color]} cursor-grab active:cursor-grabbing hover:scale-110 active:scale-100`
}
