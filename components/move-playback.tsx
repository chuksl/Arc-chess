"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, SkipBack, SkipForward, Play, Pause } from "lucide-react"
import type { ChessGame, Move, Position } from "@/lib/chess-engine"
import { createGame, makeMove } from "@/lib/chess-engine"
import { Slider } from "@/components/ui/slider"

interface MovePlaybackProps {
  game: ChessGame
  onPositionChange: (position: Position, moveIndex: number) => void
}

export default function MovePlayback({ game, onPositionChange }: MovePlaybackProps) {
  const [currentMoveIndex, setCurrentMoveIndex] = useState(game.moveHistory.length)
  const [isPlaying, setIsPlaying] = useState(false)

  const totalMoves = game.moveHistory.length

  useEffect(() => {
    if (!isPlaying) return

    if (currentMoveIndex >= totalMoves) {
      setIsPlaying(false)
      return
    }

    const timer = setTimeout(() => {
      goToMove(currentMoveIndex + 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [isPlaying, currentMoveIndex, totalMoves])

  useEffect(() => {
    const position = reconstructPositionAtMove(currentMoveIndex)
    onPositionChange(position, currentMoveIndex)
  }, [currentMoveIndex])

  const reconstructPositionAtMove = (moveIndex: number): Position => {
    let tempGame = createGame()

    for (let i = 0; i < moveIndex && i < game.moveHistory.length; i++) {
      const move = game.moveHistory[i]
      tempGame = makeMove(tempGame, move.from, move.to, move.promotedTo)
    }

    return tempGame.position
  }

  const goToMove = (index: number) => {
    const clampedIndex = Math.max(0, Math.min(index, totalMoves))
    setCurrentMoveIndex(clampedIndex)
  }

  const goToStart = () => {
    setIsPlaying(false)
    goToMove(0)
  }

  const goToEnd = () => {
    setIsPlaying(false)
    goToMove(totalMoves)
  }

  const stepBackward = () => {
    setIsPlaying(false)
    goToMove(currentMoveIndex - 1)
  }

  const stepForward = () => {
    setIsPlaying(false)
    goToMove(currentMoveIndex + 1)
  }

  const togglePlayback = () => {
    if (currentMoveIndex >= totalMoves) {
      goToMove(0)
    }
    setIsPlaying(!isPlaying)
  }

  const formatMove = (move: Move, index: number): string => {
    const moveNumber = Math.floor(index / 2) + 1
    const isWhite = index % 2 === 0
    const prefix = isWhite ? `${moveNumber}.` : ""

    let notation = ""

    if (move.isCastling) {
      notation = move.to.charCodeAt(0) > move.from.charCodeAt(0) ? "O-O" : "O-O-O"
    } else {
      const pieceSymbol = move.piece.type === "pawn" ? "" : move.piece.type[0].toUpperCase()
      const capture = move.captured ? "x" : ""
      notation = `${pieceSymbol}${capture}${move.to}`

      if (move.isPromotion) {
        notation += `=${move.promotedTo?.[0].toUpperCase()}`
      }
    }

    return `${prefix} ${notation}`.trim()
  }

  if (totalMoves === 0) {
    return (
      <Card className="p-4">
        <div className="text-center text-sm text-muted-foreground">No moves to replay yet</div>
      </Card>
    )
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Move Playback</h3>
        <div className="text-sm text-muted-foreground">
          Move {currentMoveIndex} / {totalMoves}
        </div>
      </div>

      {/* Move list */}
      <div className="max-h-32 overflow-y-auto space-y-1 text-sm">
        {game.moveHistory.map((move, index) => (
          <button
            key={index}
            onClick={() => {
              setIsPlaying(false)
              goToMove(index + 1)
            }}
            className={`w-full text-left px-2 py-1 rounded transition-colors ${
              index + 1 === currentMoveIndex ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            }`}
          >
            {formatMove(move, index)}
          </button>
        ))}
      </div>

      {/* Slider */}
      <div className="px-2">
        <Slider
          value={[currentMoveIndex]}
          onValueChange={(value) => {
            setIsPlaying(false)
            goToMove(value[0])
          }}
          max={totalMoves}
          step={1}
          className="w-full"
        />
      </div>

      {/* Playback controls */}
      <div className="flex items-center justify-center gap-2">
        <Button variant="outline" size="icon" onClick={goToStart} disabled={currentMoveIndex === 0}>
          <SkipBack className="w-4 h-4" />
        </Button>

        <Button variant="outline" size="icon" onClick={stepBackward} disabled={currentMoveIndex === 0}>
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <Button variant="default" size="icon" onClick={togglePlayback}>
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>

        <Button variant="outline" size="icon" onClick={stepForward} disabled={currentMoveIndex >= totalMoves}>
          <ChevronRight className="w-4 h-4" />
        </Button>

        <Button variant="outline" size="icon" onClick={goToEnd} disabled={currentMoveIndex >= totalMoves}>
          <SkipForward className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  )
}
