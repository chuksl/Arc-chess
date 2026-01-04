"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RotateCcw, Share2, Check, Zap, TrendingUp, Target, Crown, Trophy, Sparkles, CheckCircle } from "lucide-react"
import type { AIDifficulty } from "@/lib/chess-ai"
import { shareGameLink } from "@/lib/game-utils"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useWeb3 } from "@/lib/web3-provider"
import type { ChessGame } from "@/lib/chess-engine"
import { isGameOver } from "@/lib/chess-engine"
import LiveChat from "@/components/live-chat"

interface GameControlsProps {
  gameMode: "single" | "multi"
  aiDifficulty?: AIDifficulty
  onDifficultyChange?: (difficulty: AIDifficulty) => void
  onNewGame?: () => void
  gameId?: string | null
  playerColor?: "white" | "black" | null
  game?: ChessGame
}

export default function GameControls({
  gameMode,
  aiDifficulty = "intermediate",
  onDifficultyChange,
  onNewGame,
  gameId,
  playerColor,
  game,
}: GameControlsProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()
  const { account } = useWeb3()

  const handleShareInvite = async () => {
    if (!gameId) return

    const link = shareGameLink(gameId)

    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      toast({
        title: "Link Copied!",
        description: "Share this link with your opponent",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please copy the link manually",
        variant: "destructive",
      })
    }
  }

  const difficultyLevels: Array<{
    value: AIDifficulty
    icon: typeof Zap
    label: string
    description: string
    elo: string
  }> = [
    { value: "beginner", icon: Zap, label: "Beginner", description: "Learning basics - ELO 800", elo: "800" },
    {
      value: "intermediate",
      icon: TrendingUp,
      label: "Intermediate",
      description: "Developing skills - ELO 1200",
      elo: "1200",
    },
    { value: "advanced", icon: Target, label: "Advanced", description: "Strong tactics - ELO 1600", elo: "1600" },
    { value: "expert", icon: Crown, label: "Expert", description: "Strategic play - ELO 2000", elo: "2000" },
    { value: "master", icon: Trophy, label: "Master", description: "Deep calculations - ELO 2400", elo: "2400" },
    { value: "grandmaster", icon: Sparkles, label: "Grandmaster", description: "World-class - ELO 2800", elo: "2800" },
  ]

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h2 className="text-xl font-serif font-semibold mb-4">Game Info</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Mode:</span>
            <span className="font-medium">{gameMode === "single" ? "Single Player" : "Multiplayer"}</span>
          </div>
          {game && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className={`font-medium ${isGameOver(game) ? "text-primary" : ""}`}>
                {isGameOver(game) ? game.gameStatus : "In Progress"}
              </span>
            </div>
          )}
          {gameMode === "single" && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Difficulty:</span>
              <span className="font-medium capitalize">{aiDifficulty}</span>
            </div>
          )}
          {gameMode === "multi" && (
            <>
              {playerColor && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Playing as:</span>
                  <span className="font-medium capitalize">{playerColor}</span>
                </div>
              )}
              {gameId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Game ID:</span>
                  <span className="font-medium font-mono text-xs">{gameId}</span>
                </div>
              )}
            </>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Entry Fee:</span>
            <span className="font-medium">0.01 USDC</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Network:</span>
            <span className="font-medium">Arc Testnet</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Wallet:</span>
            <span className="font-medium font-mono text-xs">
              {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : ""}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Payment:</span>
            <span className="font-medium text-green-500 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Paid
            </span>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-serif font-semibold mb-4">Controls</h2>
        <div className="space-y-3">
          <Button variant="outline" className="w-full bg-transparent" size="lg" onClick={onNewGame}>
            <RotateCcw className="w-4 h-4 mr-2" />
            New Game
          </Button>
          {gameMode === "multi" && (
            <Button variant="outline" className="w-full bg-transparent" size="lg" onClick={handleShareInvite}>
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Share2 className="w-4 h-4 mr-2" />}
              {copied ? "Copied!" : "Share Invite"}
            </Button>
          )}
        </div>
      </Card>

      {gameMode === "single" && (
        <Card className="p-6">
          <h2 className="text-xl font-serif font-semibold mb-4">Competitive Level</h2>
          <div className="space-y-2">
            {difficultyLevels.map((level) => {
              const Icon = level.icon
              return (
                <button
                  key={level.value}
                  onClick={() => onDifficultyChange?.(level.value)}
                  className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                    aiDifficulty === level.value
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${aiDifficulty === level.value ? "bg-primary/20" : "bg-muted"}`}>
                      <Icon
                        className={`w-4 h-4 ${aiDifficulty === level.value ? "text-primary" : "text-muted-foreground"}`}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-sm">{level.label}</div>
                        <div className="text-xs font-mono text-muted-foreground">{level.elo}</div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{level.description}</div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </Card>
      )}

      {game && isGameOver(game) && (
        <Card className="p-6 bg-primary/10 border-primary">
          <div className="text-center space-y-2">
            <div className="text-2xl font-bold text-primary">{game.gameStatus}</div>
            <Button variant="default" className="w-full mt-4" size="lg" onClick={onNewGame}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Play Again
            </Button>
          </div>
        </Card>
      )}

      <LiveChat gameId={gameId} gameMode={gameMode} />

      <Card className="p-6">
        <h2 className="text-xl font-serif font-semibold mb-4">Move History</h2>
        <div className="text-sm text-muted-foreground">
          {game && game.moveHistory.length > 0 ? `${game.moveHistory.length} moves played` : "No moves yet"}
        </div>
      </Card>
    </div>
  )
}
