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
    boardLight: "bg-emerald-100",
    boardDark: "bg-emerald-500",
    borderColor: "border-emerald-400",
    glowColor: "shadow-emerald-400/50",
    accentColor: "text-emerald-600",
    pieceSet: "classic",
    boardPattern: "solid",
    pieceGlow: false,
  },
  intermediate: {
    name: "Scholar's Study",
    boardLight: "bg-sky-100",
    boardDark: "bg-sky-600",
    borderColor: "border-sky-500",
    glowColor: "shadow-sky-500/50",
    accentColor: "text-sky-700",
    pieceSet: "modern",
    boardPattern: "solid",
    pieceGlow: true,
  },
  advanced: {
    name: "Tactician's Arena",
    boardLight: "bg-violet-100",
    boardDark: "bg-violet-600",
    borderColor: "border-violet-500",
    glowColor: "shadow-violet-500/50",
    accentColor: "text-violet-700",
    pieceSet: "elegant",
    boardPattern: "gradient",
    pieceGlow: true,
  },
  expert: {
    name: "Master's Chamber",
    boardLight: "bg-rose-100",
    boardDark: "bg-rose-700",
    borderColor: "border-rose-600",
    glowColor: "shadow-rose-600/50",
    accentColor: "text-rose-800",
    pieceSet: "bold",
    boardPattern: "gradient",
    pieceGlow: true,
  },
  master: {
    name: "Champion's Court",
    boardLight: "bg-cyan-100",
    boardDark: "bg-cyan-700",
    borderColor: "border-cyan-600",
    glowColor: "shadow-cyan-600/60",
    accentColor: "text-cyan-800",
    pieceSet: "ornate",
    boardPattern: "textured",
    pieceGlow: true,
  },
  grandmaster: {
    name: "Grandmaster's Palace",
    boardLight: "bg-amber-100",
    boardDark: "bg-amber-800",
    borderColor: "border-amber-700",
    glowColor: "shadow-amber-700/70",
    accentColor: "text-amber-900",
    pieceSet: "regal",
    boardPattern: "textured",
    pieceGlow: true,
  },
}

export function getThemedPieceSymbol(piece: Piece, pieceSet: DifficultyTheme["pieceSet"]): string {
  // All piece sets now use standard Unicode symbols for clarity
  const symbols = {
    white: { king: "♔", queen: "♕", rook: "♖", bishop: "♗", knight: "♘", pawn: "♙" },
    black: { king: "♚", queen: "♛", rook: "♜", bishop: "♝", knight: "♞", pawn: "♟" },
  }

  return symbols[piece.color][piece.type]
}

export function getThemedPieceStyle(piece: Piece, theme: DifficultyTheme): string {
  const baseStyles = "transition-all duration-200 select-none cursor-grab active:cursor-grabbing"

  const sizeBySet = {
    classic: "text-5xl",
    modern: "text-5xl",
    elegant: "text-6xl",
    bold: "text-7xl font-black",
    ornate: "text-6xl font-bold",
    regal: "text-7xl font-black",
  }

  // Chess.com-style piece colors with borders for clarity
  const colorStyles = {
    white:
      "text-amber-50 [text-shadow:_-2px_-2px_0_#8b7355,_2px_-2px_0_#8b7355,_-2px_2px_0_#8b7355,_2px_2px_0_#8b7355,_0_0_8px_rgba(245,222,179,0.4)]",
    black:
      "text-amber-950 [text-shadow:_-1px_-1px_0_#d4a574,_1px_-1px_0_#d4a574,_-1px_1px_0_#d4a574,_1px_1px_0_#d4a574,_0_0_4px_rgba(139,115,85,0.3)] dark:text-stone-800 dark:[text-shadow:_-1px_-1px_0_#a8896f,_1px_-1px_0_#a8896f,_-1px_1px_0_#a8896f,_1px_1px_0_#a8896f]",
  }

  const hoverEffect = theme.pieceGlow ? "hover:scale-110 hover:[filter:brightness(1.15)]" : "hover:scale-110"

  return `${baseStyles} ${sizeBySet[theme.pieceSet]} ${colorStyles[piece.color]} ${hoverEffect} active:scale-95`
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
