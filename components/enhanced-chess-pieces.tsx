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
  const baseStyles = "text-5xl font-bold transition-all duration-300 drop-shadow-lg"

  const colorStyles = {
    white: "text-stone-200 hover:text-stone-100",
    black: "text-gray-800 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-200",
  }

  const glowStyles = {
    white: "hover:drop-shadow-[0_0_4px_rgba(245,245,244,0.3)]",
    black: "hover:drop-shadow-[0_0_6px_rgba(0,0,0,0.3)] dark:hover:drop-shadow-[0_0_6px_rgba(200,200,200,0.3)]",
  }

  return `${baseStyles} ${colorStyles[piece.color]} ${glowStyles[piece.color]} cursor-grab active:cursor-grabbing hover:scale-110`
}
