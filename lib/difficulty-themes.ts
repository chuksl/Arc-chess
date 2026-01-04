import type { AIDifficulty } from "./chess-ai"
import type { Piece } from "./chess-engine"

export interface DifficultyTheme {
  name: string
  boardLight: string
  boardDark: string
  borderColor: string
  glowColor: string
  accentColor: string
  pieceSet: "classic" | "modern" | "elegant" | "bold" | "ornate" | "regal"
  boardPattern: "solid" | "gradient" | "textured"
  pieceGlow: boolean
}

export const difficultyThemes: Record<AIDifficulty, DifficultyTheme> = {
  beginner: {
    name: "Beginner's Garden",
    boardLight: "bg-emerald-200",
    boardDark: "bg-emerald-600",
    borderColor: "border-emerald-400",
    glowColor: "shadow-emerald-400/50",
    accentColor: "text-emerald-600",
    pieceSet: "classic",
    boardPattern: "solid",
    pieceGlow: false,
  },
  intermediate: {
    name: "Scholar's Study",
    boardLight: "bg-blue-200",
    boardDark: "bg-blue-700",
    borderColor: "border-blue-500",
    glowColor: "shadow-blue-500/50",
    accentColor: "text-blue-700",
    pieceSet: "modern",
    boardPattern: "solid",
    pieceGlow: true,
  },
  advanced: {
    name: "Tactician's Arena",
    boardLight: "bg-purple-200",
    boardDark: "bg-purple-700",
    borderColor: "border-purple-500",
    glowColor: "shadow-purple-500/50",
    accentColor: "text-purple-700",
    pieceSet: "elegant",
    boardPattern: "gradient",
    pieceGlow: true,
  },
  expert: {
    name: "Master's Chamber",
    boardLight: "bg-orange-200",
    boardDark: "bg-orange-800",
    borderColor: "border-orange-600",
    glowColor: "shadow-orange-600/50",
    accentColor: "text-orange-800",
    pieceSet: "bold",
    boardPattern: "gradient",
    pieceGlow: true,
  },
  master: {
    name: "Champion's Court",
    boardLight: "bg-red-200",
    boardDark: "bg-red-800",
    borderColor: "border-red-600",
    glowColor: "shadow-red-600/60",
    accentColor: "text-red-800",
    pieceSet: "ornate",
    boardPattern: "textured",
    pieceGlow: true,
  },
  grandmaster: {
    name: "Grandmaster's Palace",
    boardLight: "bg-amber-200",
    boardDark: "bg-amber-900",
    borderColor: "border-amber-700",
    glowColor: "shadow-amber-700/70",
    accentColor: "text-amber-900",
    pieceSet: "regal",
    boardPattern: "textured",
    pieceGlow: true,
  },
}

export function getThemedPieceSymbol(piece: Piece, pieceSet: DifficultyTheme["pieceSet"]): string {
  const pieceSets = {
    classic: {
      white: { king: "♔", queen: "♕", rook: "♖", bishop: "♗", knight: "♘", pawn: "♙" },
      black: { king: "♚", queen: "♛", rook: "♜", bishop: "♝", knight: "♞", pawn: "♟" },
    },
    modern: {
      white: { king: "🤴", queen: "👸", rook: "🏰", bishop: "⛪", knight: "🐎", pawn: "🔘" },
      black: { king: "🤴🏿", queen: "👸🏿", rook: "🏯", bishop: "🕌", knight: "🐴", pawn: "⚫" },
    },
    elegant: {
      white: { king: "♔", queen: "♕", rook: "♖", bishop: "♗", knight: "♘", pawn: "♙" },
      black: { king: "♚", queen: "♛", rook: "♜", bishop: "♝", knight: "♞", pawn: "♟" },
    },
    bold: {
      white: { king: "♔", queen: "♕", rook: "♖", bishop: "♗", knight: "♘", pawn: "♙" },
      black: { king: "♚", queen: "♛", rook: "♜", bishop: "♝", knight: "♞", pawn: "♟" },
    },
    ornate: {
      white: { king: "♔", queen: "♕", rook: "♖", bishop: "♗", knight: "♘", pawn: "♙" },
      black: { king: "♚", queen: "♛", rook: "♜", bishop: "♝", knight: "♞", pawn: "♟" },
    },
    regal: {
      white: { king: "♔", queen: "♕", rook: "♖", bishop: "♗", knight: "♘", pawn: "♙" },
      black: { king: "♚", queen: "♛", rook: "♜", bishop: "♝", knight: "♞", pawn: "♟" },
    },
  }

  return pieceSets[pieceSet][piece.color][piece.type]
}

export function getThemedPieceStyle(piece: Piece, theme: DifficultyTheme): string {
  const baseStyles = "transition-all duration-300 cursor-grab active:cursor-grabbing"

  const sizeBySet = {
    classic: "text-4xl",
    modern: "text-3xl",
    elegant: "text-5xl",
    bold: "text-6xl font-black",
    ornate: "text-5xl",
    regal: "text-6xl font-bold",
  }

  const colorStyles = {
    white: "text-stone-200",
    black: "text-gray-800 dark:text-gray-300",
  }

  const glowEffect = theme.pieceGlow
    ? piece.color === "white"
      ? "drop-shadow-[0_0_6px_rgba(245,245,244,0.25)] hover:drop-shadow-[0_0_8px_rgba(245,245,244,0.3)]"
      : "drop-shadow-[0_0_6px_rgba(0,0,0,0.4)] dark:drop-shadow-[0_0_8px_rgba(200,200,200,0.4)] hover:drop-shadow-[0_0_8px_rgba(0,0,0,0.5)] dark:hover:drop-shadow-[0_0_10px_rgba(200,200,200,0.5)]"
    : "drop-shadow-md"

  const hoverEffect = "hover:scale-110 hover:rotate-2"

  return `${baseStyles} ${sizeBySet[theme.pieceSet]} ${colorStyles[piece.color]} ${glowEffect} ${hoverEffect}`
}

export function getThemedSquareStyle(isLight: boolean, theme: DifficultyTheme, row: number, col: number): string {
  const baseColor = isLight ? theme.boardLight : theme.boardDark

  if (theme.boardPattern === "gradient") {
    const gradientIntensity = isLight ? "from-transparent to-white/10" : "from-transparent to-black/20"
    return `${baseColor} bg-gradient-to-br ${gradientIntensity}`
  }

  if (theme.boardPattern === "textured") {
    const texture = isLight
      ? "bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)]"
      : "bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.2),transparent)]"
    return `${baseColor} ${texture}`
  }

  return baseColor
}
