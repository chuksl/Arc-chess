"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, Check, Users, Plus } from "lucide-react"
import { generateGameId } from "@/lib/game-utils"
import { useToast } from "@/hooks/use-toast"
import PaymentDialog from "@/components/payment-dialog"
import { useWeb3 } from "@/lib/web3-provider"

interface MultiplayerSetupProps {
  existingGameId: string | null
  onReady: (gameId: string, playerColor: "white" | "black") => void
}

export default function MultiplayerSetup({ existingGameId, onReady }: MultiplayerSetupProps) {
  const [mode, setMode] = useState<"create" | "join" | null>(existingGameId ? "join" : null)
  const [gameId, setGameId] = useState(existingGameId || "")
  const [inviteLink, setInviteLink] = useState("")
  const [copied, setCopied] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [pendingColor, setPendingColor] = useState<"white" | "black" | null>(null)
  const { toast } = useToast()
  const { isConnected, isCorrectNetwork } = useWeb3()

  useEffect(() => {
    if (existingGameId) {
      setMode("join")
      setGameId(existingGameId)
    }
  }, [existingGameId])

  const handleCreateGame = () => {
    const newGameId = generateGameId()
    setGameId(newGameId)

    const link = `${window.location.origin}/play?mode=multi&invite=${newGameId}`
    setInviteLink(link)

    toast({
      title: "Game Created",
      description: "Share the invite link with your opponent",
    })
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      toast({
        title: "Copied!",
        description: "Invite link copied to clipboard",
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

  const handleStartGame = () => {
    if (!isConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet first",
        variant: "destructive",
      })
      return
    }

    if (!isCorrectNetwork) {
      toast({
        title: "Wrong Network",
        description: "Please switch to Arc Testnet",
        variant: "destructive",
      })
      return
    }

    const color = mode === "create" ? "white" : "black"
    setPendingColor(color)
    setShowPaymentDialog(true)
  }

  const handlePaymentSuccess = (txHash: string) => {
    if (pendingColor) {
      toast({
        title: "Ready to Play!",
        description: "Entry fee paid successfully",
      })
      onReady(gameId, pendingColor)
    }
  }

  if (!mode) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="max-w-2xl w-full space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-serif font-bold">Multiplayer Chess</h2>
            <p className="text-muted-foreground">Create a new game or join an existing one</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setMode("create")}>
              <div className="space-y-4 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Plus className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-serif font-semibold">Create Game</h3>
                <p className="text-sm text-muted-foreground">Start a new game and invite your opponent</p>
              </div>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setMode("join")}>
              <div className="space-y-4 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-serif font-semibold">Join Game</h3>
                <p className="text-sm text-muted-foreground">Enter an invite code to join a match</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (mode === "create") {
    return (
      <>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="p-8 max-w-2xl w-full space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-serif font-semibold">Create New Game</h2>
              <p className="text-muted-foreground">Share the invite link with your opponent</p>
            </div>

            {!gameId ? (
              <Button className="w-full" size="lg" onClick={handleCreateGame}>
                <Plus className="w-4 h-4 mr-2" />
                Generate Invite Link
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Invite Link</Label>
                  <div className="flex gap-2">
                    <Input value={inviteLink} readOnly className="font-mono text-sm" />
                    <Button variant="outline" size="icon" onClick={handleCopyLink}>
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Game ID</Label>
                  <Input value={gameId} readOnly className="font-mono text-sm" />
                </div>

                <div className="bg-muted/50 border border-border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Ready to start</p>
                      <p className="text-xs text-muted-foreground">
                        Click the button below to pay the entry fee and start the game. Share the invite link with your
                        opponent.
                      </p>
                    </div>
                  </div>
                </div>

                <Button className="w-full" size="lg" onClick={handleStartGame}>
                  Pay Entry Fee & Start Game
                </Button>

                <Button variant="ghost" className="w-full" onClick={() => setMode(null)}>
                  Back
                </Button>
              </div>
            )}
          </Card>
        </div>

        <PaymentDialog
          open={showPaymentDialog}
          onOpenChange={setShowPaymentDialog}
          onPaymentSuccess={handlePaymentSuccess}
        />
      </>
    )
  }

  if (mode === "join") {
    return (
      <>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="p-8 max-w-2xl w-full space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-serif font-semibold">Join Game</h2>
              <p className="text-muted-foreground">Enter the invite code to join a match</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Game Invite Code</Label>
                <Input
                  value={gameId}
                  onChange={(e) => setGameId(e.target.value)}
                  placeholder="Enter invite code..."
                  className="font-mono"
                />
              </div>

              {gameId && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Game found!</p>
                      <p className="text-xs text-muted-foreground">
                        Connect your wallet and pay the 0.01 USDC entry fee to join this match.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Button className="w-full" size="lg" disabled={!gameId} onClick={handleStartGame}>
                Pay Entry Fee & Join Match
              </Button>

              <Button variant="ghost" className="w-full" onClick={() => setMode(null)}>
                Back
              </Button>
            </div>
          </Card>
        </div>

        <PaymentDialog
          open={showPaymentDialog}
          onOpenChange={setShowPaymentDialog}
          onPaymentSuccess={handlePaymentSuccess}
        />
      </>
    )
  }

  return null
}
