"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { ChessGame, Square, PieceType, Position } from "@/lib/chess-engine"
import {
  createGame,
  getPossibleMoves,
  makeMove,
  isGameOver,
  getBoardPosition,
  isInCheck,
  getGameResult,
  requiresPromotion,
} from "@/lib/chess-engine"
import { getAIMove, simulateAIThinking, type AIDifficulty } from "@/lib/chess-ai"
import { Loader2, Crown, AlertTriangle } from "lucide-react"
import DifficultySwitcher from "@/components/difficulty-switcher"
import { updateUserStats, saveGameResult } from "@/lib/user-stats"
import { useWeb3 } from "@/lib/web3-provider"
import {
  difficultyThemes,
  getThemedPieceSymbol,
  getThemedPieceStyle,
  getThemedSquareStyle,
} from "@/lib/difficulty-themes"
import { playWinSound, playLossSound, playDrawSound } from "@/lib/audio-effects"
import { createTimer, switchPlayer, type TimeControl, type GameTimer } from "@/lib/time-controls"
import ChessClock from "@/components/chess-clock"
import MovePlayback from "@/components/move-playback"

interface ChessBoardProps {
  gameMode: "single" | "multi"
  aiDifficulty?: AIDifficulty
  onGameUpdate?: (game: ChessGame) => void
  gameId?: string | null
  playerColor?: "white" | "black" | null
  onDifficultyChange?: (difficulty: AIDifficulty) => void
  timeControl?: TimeControl
}

export default function ChessBoard({
  gameMode,
  aiDifficulty = "intermediate",
  onGameUpdate,
  gameId,
  playerColor,
  onDifficultyChange,
  timeControl = "rapid",
}: ChessBoardProps) {
  const [game, setGame] = useState<ChessGame>(createGame())
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null)
  const [possibleMoves, setPossibleMoves] = useState<Square[]>([])
  const [isAIThinking, setIsAIThinking] = useState(false)
  const [promotionDialogOpen, setPromotionDialogOpen] = useState(false)
  const [promotionMove, setPromotionMove] = useState<{ from: Square; to: Square } | null>(null)
  const [gameResultRecorded, setGameResultRecorded] = useState(false)
  const [timer, setTimer] = useState<GameTimer>(createTimer(timeControl))
  const [timeUpPlayer, setTimeUpPlayer] = useState<"white" | "black" | null>(null)
  const [isPlaybackMode, setIsPlaybackMode] = useState(false)
  const [playbackPosition, setPlaybackPosition] = useState<Position | null>(null)
  const [playbackMoveIndex, setPlaybackMoveIndex] = useState(0)
  const { account } = useWeb3()

  useEffect(() => {
    if (!isGameOver(game) && !timer.isRunning && game.moveHistory.length > 0) {
      setTimer((prev) => ({ ...prev, isRunning: true }))
    }
  }, [game, timer.isRunning])

  useEffect(() => {
    if (isGameOver(game) && account && !gameResultRecorded) {
      const result = getGameResult(game)
      let playerResult: "win" | "loss" | "draw" = "draw"

      if (result.includes("White wins")) {
        playerResult = gameMode === "single" || playerColor === "white" ? "win" : "loss"
      } else if (result.includes("Black wins")) {
        playerResult = gameMode === "single" ? "loss" : playerColor === "black" ? "win" : "loss"
      }

      if (playerResult === "win") {
        playWinSound()
      } else if (playerResult === "loss") {
        playLossSound()
      } else {
        playDrawSound()
      }

      updateUserStats(account, playerResult)
      saveGameResult({
        gameId: gameId || `single_${Date.now()}`,
        playerAddress: account,
        opponentAddress: null,
        result: playerResult,
        gameMode,
        timestamp: Date.now(),
      })

      setGameResultRecorded(true)
    }
  }, [game, account, gameResultRecorded, gameMode, playerColor, gameId])

  useEffect(() => {
    if (timeUpPlayer && account && !gameResultRecorded) {
      const playerResult: "win" | "loss" | "draw" =
        gameMode === "single"
          ? timeUpPlayer === "white"
            ? "loss"
            : "win"
          : timeUpPlayer === playerColor
            ? "loss"
            : "win"

      if (playerResult === "win") {
        playWinSound()
      } else if (playerResult === "loss") {
        playLossSound()
      }

      updateUserStats(account, playerResult)
      saveGameResult({
        gameId: gameId || `single_${Date.now()}`,
        playerAddress: account,
        opponentAddress: null,
        result: playerResult,
        gameMode,
        timestamp: Date.now(),
      })

      setGameResultRecorded(true)
    }
  }, [timeUpPlayer, account, gameResultRecorded, gameMode, playerColor, gameId])

  useEffect(() => {
    if (!isGameOver(game)) {
      setGameResultRecorded(false)
      setTimeUpPlayer(null)
    }
  }, [game])

  useEffect(() => {
    if (gameMode === "single" && game.currentPlayer === "black" && !isGameOver(game) && !isAIThinking) {
      setIsAIThinking(true)

      const makeAIMove = async () => {
        await simulateAIThinking(aiDifficulty)

        const timeControlConfig =
          timeControl === "blitz"
            ? { minutes: 3, increment: 2 }
            : timeControl === "rapid"
              ? { minutes: 10, increment: 5 }
              : timeControl === "classical"
                ? { minutes: 30, increment: 30 }
                : { minutes: 999, increment: 0 }

        const aiMove = await getAIMove(game, aiDifficulty, timeControlConfig)

        if (aiMove) {
          const newGame = makeMove(game, aiMove.from, aiMove.to, "queen")
          setGame(newGame)
          onGameUpdate?.(newGame)
          setTimer((prev) => switchPlayer(prev, timeControl, "white"))
        }

        setIsAIThinking(false)
      }

      makeAIMove()
    }
  }, [game, gameMode, aiDifficulty, isAIThinking, onGameUpdate, timeControl])

  const handleSquareClick = (square: Square) => {
    if (isPlaybackMode) return
    if (isAIThinking) return

    if (gameMode === "multi" && playerColor && game.currentPlayer !== playerColor) return

    if (gameMode === "single" && game.currentPlayer === "black") return

    const position = getBoardPosition(game)
    const piece = position[square]

    if (selectedSquare) {
      if (possibleMoves.includes(square)) {
        if (requiresPromotion(game, selectedSquare, square)) {
          setPromotionMove({ from: selectedSquare, to: square })
          setPromotionDialogOpen(true)
        } else {
          const newGame = makeMove(game, selectedSquare, square)
          setGame(newGame)
          onGameUpdate?.(newGame)
          setTimer((prev) => switchPlayer(prev, timeControl, newGame.currentPlayer))
        }
        setSelectedSquare(null)
        setPossibleMoves([])
      } else if (piece && piece.color === game.currentPlayer) {
        setSelectedSquare(square)
        setPossibleMoves(getPossibleMoves(game, square))
      } else {
        setSelectedSquare(null)
        setPossibleMoves([])
      }
    } else {
      if (piece && piece.color === game.currentPlayer) {
        setSelectedSquare(square)
        setPossibleMoves(getPossibleMoves(game, square))
      }
    }
  }

  const handlePromotion = (pieceType: PieceType) => {
    if (promotionMove) {
      const newGame = makeMove(game, promotionMove.from, promotionMove.to, pieceType)
      setGame(newGame)
      onGameUpdate?.(newGame)
      setTimer((prev) => switchPlayer(prev, timeControl, newGame.currentPlayer))
      setPromotionDialogOpen(false)
      setPromotionMove(null)
    }
  }

  const handleTimeExpired = (player: "white" | "black") => {
    setTimeUpPlayer(player)
    setTimer((prev) => ({ ...prev, isRunning: false }))
  }

  const handlePlaybackPositionChange = (position: Position, moveIndex: number) => {
    setPlaybackPosition(position)
    setPlaybackMoveIndex(moveIndex)
    setIsPlaybackMode(moveIndex < game.moveHistory.length)
  }

  useEffect(() => {
    if (playbackMoveIndex === game.moveHistory.length) {
      setIsPlaybackMode(false)
      setPlaybackPosition(null)
    }
  }, [playbackMoveIndex, game.moveHistory.length])

  const renderSquare = (square: Square, row: number, col: number) => {
    const displayPosition = isPlaybackMode && playbackPosition ? playbackPosition : getBoardPosition(game)
    const piece = displayPosition[square]
    const isLight = (row + col) % 2 === 0
    const isSelected = !isPlaybackMode && selectedSquare === square
    const isPossibleMove = !isPlaybackMode && possibleMoves.includes(square)

    const currentTheme = difficultyThemes[aiDifficulty]

    const squareStyle = getThemedSquareStyle(isLight, currentTheme, row, col)

    return (
      <button
        key={square}
        onClick={() => handleSquareClick(square)}
        className={`
          aspect-square flex items-center justify-center relative
          transition-all duration-200 hover:scale-105
          ${squareStyle}
          ${isSelected ? `ring-4 ${currentTheme.accentColor} ring-inset` : ""}
          ${isAIThinking || isPlaybackMode ? "cursor-wait" : "cursor-pointer"}
        `}
        disabled={isAIThinking || isPlaybackMode}
      >
        {piece && (
          <span className={getThemedPieceStyle(piece, currentTheme)}>
            {getThemedPieceSymbol(piece, currentTheme.pieceSet)}
          </span>
        )}
        {isPossibleMove && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={`w-3 h-3 rounded-full ${piece ? `border-4 ${currentTheme.borderColor} w-full h-full opacity-30` : `${currentTheme.boardDark} opacity-40`}`}
            />
          </div>
        )}
      </button>
    )
  }

  const squares: Square[] = []
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const file = String.fromCharCode(97 + col) as "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h"
      const rank = (8 - row).toString() as "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8"
      squares.push(`${file}${rank}`)
    }
  }

  const getTurnMessage = () => {
    if (timeUpPlayer) {
      return `${timeUpPlayer === "white" ? "Black" : "White"} wins on time!`
    }

    if (isGameOver(game)) {
      return getGameResult(game)
    }

    const checkStatus = isInCheck(game) ? " (Check!)" : ""

    if (gameMode === "single") {
      return `${game.currentPlayer === "white" ? "White" : "Black"} to move${checkStatus}`
    }

    if (playerColor) {
      return `${game.currentPlayer === playerColor ? "Your turn" : "Opponent's turn"}${checkStatus}`
    }

    return `${game.currentPlayer === "white" ? "White" : "Black"} to move${checkStatus}`
  }

  return (
    <>
      <Card className="p-4 md:p-8">
        {gameMode === "single" && onDifficultyChange && (
          <div className="mb-4 max-w-xs mx-auto">
            <DifficultySwitcher
              currentDifficulty={aiDifficulty}
              onDifficultyChange={onDifficultyChange}
              disabled={isAIThinking || !isGameOver(game)}
            />
          </div>
        )}

        <div className="text-center mb-4">
          <h3 className={`text-xl font-serif font-semibold ${difficultyThemes[aiDifficulty].accentColor}`}>
            {difficultyThemes[aiDifficulty].name}
          </h3>
        </div>

        <ChessClock timer={timer} timeControl={timeControl} onTimeExpired={handleTimeExpired} />

        <div className="aspect-square w-full max-w-2xl mx-auto">
          <div
            className={`grid grid-cols-8 gap-0 border-4 ${difficultyThemes[aiDifficulty].borderColor} rounded-lg overflow-hidden shadow-2xl ${difficultyThemes[aiDifficulty].glowColor}`}
          >
            {squares.map((square, index) => {
              const row = Math.floor(index / 8)
              const col = index % 8
              return renderSquare(square, row, col)
            })}
          </div>
        </div>

        <div className="mt-6 text-center space-y-2">
          {isPlaybackMode && (
            <div className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-lg">
              Reviewing move {playbackMoveIndex} of {game.moveHistory.length}
            </div>
          )}

          {isAIThinking ? (
            <div
              className={`flex items-center justify-center gap-2 text-lg font-semibold ${difficultyThemes[aiDifficulty].accentColor}`}
            >
              <Loader2 className="w-5 h-5 animate-spin" />
              AI is thinking...
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                {isInCheck(game) && !isGameOver(game) && !timeUpPlayer && (
                  <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
                )}
                {(isGameOver(game) && game.gameStatus === "checkmate") || timeUpPlayer ? (
                  <Crown className={`w-6 h-6 ${difficultyThemes[aiDifficulty].accentColor}`} />
                ) : null}
                <div
                  className={`text-lg font-semibold ${
                    isGameOver(game) || timeUpPlayer
                      ? `text-2xl ${difficultyThemes[aiDifficulty].accentColor}`
                      : isInCheck(game)
                        ? "text-yellow-600 dark:text-yellow-500"
                        : ""
                  }`}
                >
                  {getTurnMessage()}
                </div>
              </div>
            </div>
          )}
        </div>

        {game.moveHistory.length > 0 && (
          <div className="mt-6">
            <MovePlayback game={game} onPositionChange={handlePlaybackPositionChange} />
          </div>
        )}
      </Card>

      <Dialog open={promotionDialogOpen} onOpenChange={setPromotionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose Promotion Piece</DialogTitle>
            <DialogDescription>Select which piece you want to promote your pawn to.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-4 gap-4 py-4">
            {(["queen", "rook", "bishop", "knight"] as PieceType[]).map((pieceType) => (
              <Button
                key={pieceType}
                variant="outline"
                className="h-24 text-5xl hover:bg-primary/10 bg-transparent"
                onClick={() => handlePromotion(pieceType)}
              >
                {getThemedPieceSymbol(
                  { type: pieceType, color: game.currentPlayer },
                  difficultyThemes[aiDifficulty].pieceSet,
                )}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
