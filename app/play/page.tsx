"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import ChessBoard from "@/components/chess-board"
import GameControls from "@/components/game-controls"
import MultiplayerSetup from "@/components/multiplayer-setup"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Wallet, AlertCircle } from "lucide-react"
import Link from "next/link"
import { createGame, type ChessGame } from "@/lib/chess-engine"
import type { AIDifficulty } from "@/lib/chess-ai"
import type { TimeControl } from "@/lib/time-controls"
import ThemeToggle from "@/components/theme-toggle"
import { useWeb3 } from "@/lib/web3-provider"
import PaymentDialog from "@/components/payment-dialog"
import UserProfileTabs from "@/components/user-profile-tabs"
import NavigationMenu from "@/components/navigation-menu"

function PlayPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { account, isConnected, isCorrectNetwork, connect, switchToArcNetwork } = useWeb3()
  const [gameMode, setGameMode] = useState<"single" | "multi" | null>(null)
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>("intermediate")
  const [timeControl, setTimeControl] = useState<TimeControl>("rapid")
  const [game, setGame] = useState<ChessGame>(createGame())
  const [hasPaid, setHasPaid] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [gameId, setGameId] = useState<string | null>(null)
  const [playerColor, setPlayerColor] = useState<"white" | "black" | null>(null)
  const [multiplayerReady, setMultiplayerReady] = useState(false)

  const handleMultiplayerReady = (ready: boolean) => {
    setMultiplayerReady(ready)
  }

  useEffect(() => {
    const mode = searchParams.get("mode")
    const inviteCode = searchParams.get("invite")

    if (mode === "single" || mode === "multi") {
      setGameMode(mode)

      if (mode === "multi" && inviteCode) {
        setGameId(inviteCode)
      }
    }
  }, [searchParams])

  const handleNewGame = () => {
    setHasPaid(false)
    setGame(createGame())
    if (gameMode === "multi") {
      setGameId(null)
      setPlayerColor(null)
      setMultiplayerReady(false)
    }
  }

  const handleDifficultyChange = (difficulty: AIDifficulty) => {
    setAiDifficulty(difficulty)
    setGame(createGame())
    setHasPaid(false)
  }

  const handleStartGame = () => {
    if (!isConnected) {
      connect()
    } else if (!isCorrectNetwork) {
      switchToArcNetwork()
    } else if (!hasPaid) {
      setShowPaymentDialog(true)
    }
  }

  const handlePaymentSuccess = (txHash: string, difficulty?: AIDifficulty, selectedTimeControl?: TimeControl) => {
    setHasPaid(true)
    setShowPaymentDialog(false)
    if (difficulty) {
      setAiDifficulty(difficulty)
    }
    if (selectedTimeControl) {
      setTimeControl(selectedTimeControl)
    }
  }

  if (!gameMode) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
        <div
          className="absolute inset-0 opacity-[0.08] dark:opacity-[0.12]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fillOpacity='1'%3E%3Cpath d='M0 0h40v40H0V0zm40 40h40v40H40V40z'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "40px 40px",
          }}
        />
        <Card className="p-8 max-w-md w-full text-center space-y-4 relative z-10">
          <h2 className="text-2xl font-serif font-semibold">Select Game Mode</h2>
          <p className="text-muted-foreground">Choose how you want to play</p>
          <div className="space-y-3">
            <Button className="w-full" onClick={() => router.push("/play?mode=single")}>
              Single Player
            </Button>
            <Button className="w-full bg-transparent" variant="outline" onClick={() => router.push("/play?mode=multi")}>
              Multiplayer
            </Button>
          </div>
          <Button variant="ghost" className="w-full" asChild>
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </Card>
      </div>
    )
  }

  if (!isConnected || !isCorrectNetwork || !hasPaid) {
    return (
      <div className="min-h-screen bg-background relative">
        <div
          className="absolute inset-0 opacity-[0.08] dark:opacity-[0.12]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23000000' fillOpacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v6h6V4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "30px 30px",
          }}
        />

        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Link>
            </Button>
            <h1 className="text-lg font-serif font-semibold">
              {gameMode === "single" ? "Single Player" : "Multiplayer Match"}
            </h1>
            <div className="flex items-center gap-2">
              <NavigationMenu />
              <UserProfileTabs />
              <ThemeToggle />
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="max-w-md mx-auto">
            <Card className="p-8 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <Wallet className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-serif font-semibold">Setup Required</h2>
                <p className="text-muted-foreground">Connect your wallet and pay the entry fee to start playing</p>
              </div>

              <div className="space-y-4">
                <div
                  className={`p-4 rounded-lg border-2 ${isConnected ? "border-green-500 bg-green-500/10" : "border-border bg-card"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${isConnected ? "bg-green-500" : "bg-muted"}`}
                      >
                        <span className={`text-sm font-bold ${isConnected ? "text-white" : "text-muted-foreground"}`}>
                          1
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold">Connect Wallet</div>
                        <div className="text-xs text-muted-foreground">
                          {isConnected ? `Connected: ${account?.slice(0, 6)}...${account?.slice(-4)}` : "Not connected"}
                        </div>
                      </div>
                    </div>
                    {!isConnected && (
                      <Button size="sm" onClick={connect}>
                        Connect
                      </Button>
                    )}
                  </div>
                </div>

                <div
                  className={`p-4 rounded-lg border-2 ${isConnected && isCorrectNetwork ? "border-green-500 bg-green-500/10" : isConnected ? "border-yellow-500 bg-yellow-500/10" : "border-border bg-muted/50"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${isConnected && isCorrectNetwork ? "bg-green-500" : isConnected ? "bg-yellow-500" : "bg-muted"}`}
                      >
                        <span
                          className={`text-sm font-bold ${isConnected && isCorrectNetwork ? "text-white" : isConnected ? "text-white" : "text-muted-foreground"}`}
                        >
                          2
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold">Arc Testnet</div>
                        <div className="text-xs text-muted-foreground">
                          {!isConnected
                            ? "Connect wallet first"
                            : isCorrectNetwork
                              ? "Connected to Arc Testnet"
                              : "Wrong network"}
                        </div>
                      </div>
                    </div>
                    {isConnected && !isCorrectNetwork && (
                      <Button size="sm" onClick={switchToArcNetwork}>
                        Switch
                      </Button>
                    )}
                  </div>
                </div>

                <div
                  className={`p-4 rounded-lg border-2 ${hasPaid ? "border-green-500 bg-green-500/10" : isConnected && isCorrectNetwork ? "border-border bg-card" : "border-border bg-muted/50"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${hasPaid ? "bg-green-500" : isConnected && isCorrectNetwork ? "bg-muted" : "bg-muted"}`}
                      >
                        <span className={`text-sm font-bold ${hasPaid ? "text-white" : "text-muted-foreground"}`}>
                          3
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold">Pay Entry Fee</div>
                        <div className="text-xs text-muted-foreground">
                          {hasPaid ? "Paid 0.01 USDC" : "0.01 USDC required"}
                        </div>
                      </div>
                    </div>
                    {isConnected && isCorrectNetwork && !hasPaid && (
                      <Button size="sm" onClick={() => setShowPaymentDialog(true)}>
                        Pay Now
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleStartGame}
                  disabled={!isConnected || !isCorrectNetwork || !hasPaid}
                >
                  {!isConnected
                    ? "Connect Wallet to Continue"
                    : !isCorrectNetwork
                      ? "Switch Network to Continue"
                      : !hasPaid
                        ? "Pay Entry Fee to Continue"
                        : "Start Game"}
                </Button>
              </div>

              <Card className="p-4 bg-primary/5 border-primary/20">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Entry Fee Required</p>
                    <p className="text-xs text-muted-foreground">
                      All games require a 0.01 USDC entry fee on the Arc Testnet to play
                    </p>
                  </div>
                </div>
              </Card>
            </Card>
          </div>
        </div>

        <PaymentDialog
          open={showPaymentDialog}
          onOpenChange={setShowPaymentDialog}
          onPaymentSuccess={handlePaymentSuccess}
          gameMode={gameMode || "single"}
        />
      </div>
    )
  }

  if (gameMode === "multi" && !multiplayerReady) {
    return (
      <div className="min-h-screen bg-background relative">
        <div
          className="absolute inset-0 opacity-[0.08] dark:opacity-[0.12]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fillOpacity='1'%3E%3Cpath d='M0 0h40v40H0V0zm40 40h40v40H40V40z'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "40px 40px",
          }}
        />

        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Link>
            </Button>
            <h1 className="text-lg font-serif font-semibold">Multiplayer Setup</h1>
            <div className="flex items-center gap-2">
              <NavigationMenu />
              <UserProfileTabs />
              <ThemeToggle />
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8 relative z-10">
          <MultiplayerSetup existingGameId={gameId} onReady={handleMultiplayerReady} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3 pointer-events-none" />

      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
          <h1 className="text-lg font-serif font-semibold">
            {gameMode === "single" ? "Single Player" : "Multiplayer Match"}
          </h1>
          <div className="flex items-center gap-2">
            <NavigationMenu />
            <UserProfileTabs />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr,400px] gap-8">
          <div>
            <ChessBoard
              gameMode={gameMode}
              aiDifficulty={aiDifficulty}
              onGameUpdate={setGame}
              gameId={gameId}
              playerColor={playerColor}
              onDifficultyChange={handleDifficultyChange}
              timeControl={timeControl}
            />
          </div>
          <div>
            <GameControls
              gameMode={gameMode}
              aiDifficulty={aiDifficulty}
              onDifficultyChange={handleDifficultyChange}
              onNewGame={handleNewGame}
              gameId={gameId}
              playerColor={playerColor}
              game={game}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PlayPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      }
    >
      <PlayPageContent />
    </Suspense>
  )
}
