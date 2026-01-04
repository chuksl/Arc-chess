"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useWeb3 } from "@/lib/web3-provider"
import { checkUSDCBalance, payEntryFee, formatUSDC } from "@/lib/payment-utils"
import { Loader2, CheckCircle, XCircle, Wallet } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ENTRY_FEE_USDC } from "@/lib/web3-config"
import { difficultyConfig, type AIDifficulty } from "@/lib/chess-ai"
import { timeControls, type TimeControl } from "@/lib/time-controls"

interface PaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPaymentSuccess: (txHash: string, difficulty?: AIDifficulty, timeControl?: TimeControl) => void
  gameMode: "single" | "multi"
}

export default function PaymentDialog({ open, onOpenChange, onPaymentSuccess, gameMode }: PaymentDialogProps) {
  const { account, provider, signer, isConnected, isCorrectNetwork } = useWeb3()
  const [balance, setBalance] = useState<string>("0")
  const [isLoading, setIsLoading] = useState(false)
  const [isPaying, setIsPaying] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [selectedDifficulty, setSelectedDifficulty] = useState<AIDifficulty>("intermediate")
  const [selectedTimeControl, setSelectedTimeControl] = useState<TimeControl>("rapid")
  const { toast } = useToast()

  useEffect(() => {
    if (open && isConnected && provider && account) {
      loadBalance()
    }
  }, [open, isConnected, provider, account])

  const loadBalance = async () => {
    if (!provider || !account) return

    setIsLoading(true)
    try {
      const usdcBalance = await checkUSDCBalance(provider, account)
      console.log("[v0] Loaded USDC balance:", usdcBalance)
      setBalance(usdcBalance)
    } catch (error) {
      console.error("[v0] Error loading balance:", error)
      toast({
        title: "Error",
        description: "Failed to load USDC balance",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!signer) return

    setIsPaying(true)
    setPaymentStatus("idle")
    setErrorMessage("")

    try {
      const result = await payEntryFee(signer)

      if (result.success && result.txHash) {
        setPaymentStatus("success")
        toast({
          title: "Payment Successful!",
          description: "Entry fee paid. You can now start the match.",
        })

        setTimeout(() => {
          onPaymentSuccess(result.txHash, gameMode === "single" ? selectedDifficulty : undefined, selectedTimeControl)
          onOpenChange(false)
        }, 2000)
      } else {
        setPaymentStatus("error")
        setErrorMessage(result.error || "Payment failed")
        toast({
          title: "Payment Failed",
          description: result.error || "Please try again",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      setPaymentStatus("error")
      setErrorMessage(error.message || "Payment failed")
      toast({
        title: "Payment Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsPaying(false)
    }
  }

  const hasEnoughBalance = Number.parseFloat(balance) >= Number.parseFloat(ENTRY_FEE_USDC) + 0.01

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">Entry Fee Required</DialogTitle>
          <DialogDescription>
            {gameMode === "single"
              ? `Choose your opponent difficulty and time control, then pay ${ENTRY_FEE_USDC} USDC to start`
              : `Select time control and pay ${ENTRY_FEE_USDC} USDC to enter this multiplayer match`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!isConnected ? (
            <div className="text-center py-8">
              <Wallet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Please connect your wallet first</p>
            </div>
          ) : !isCorrectNetwork ? (
            <div className="text-center py-8">
              <XCircle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
              <p className="text-sm text-muted-foreground">Please switch to Arc Testnet</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <label className="text-sm font-medium">Select Time Control</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(timeControls) as TimeControl[]).map((tc) => {
                    const config = timeControls[tc]
                    return (
                      <button
                        key={tc}
                        onClick={() => setSelectedTimeControl(tc)}
                        className={`p-3 rounded-lg border-2 transition-all text-center ${
                          selectedTimeControl === tc
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="text-2xl mb-1">{config.icon}</div>
                        <div className="font-semibold text-sm">{config.name}</div>
                        <div className="text-xs text-muted-foreground">{config.description}</div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {gameMode === "single" && (
                <div className="space-y-3">
                  <label className="text-sm font-medium">Select Difficulty Level</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(difficultyConfig) as AIDifficulty[]).map((difficulty) => {
                      const config = difficultyConfig[difficulty]
                      const Icon = config.icon
                      return (
                        <button
                          key={difficulty}
                          onClick={() => setSelectedDifficulty(difficulty)}
                          className={`p-3 rounded-lg border-2 transition-all text-left ${
                            selectedDifficulty === difficulty
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className="w-4 h-4" />
                            <span className="font-semibold text-sm capitalize">{difficulty}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">ELO: {config.eloRating}</div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="bg-muted rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Your USDC Balance</span>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span className="font-semibold">{formatUSDC(balance)}</span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Entry Fee</span>
                  <span className="font-semibold">{ENTRY_FEE_USDC} USDC</span>
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Est. Gas Fee</span>
                  <span>~0.01 USDC</span>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total</span>
                    <span className="font-bold text-lg">{ENTRY_FEE_USDC} USDC</span>
                  </div>
                </div>
              </div>

              {!hasEnoughBalance && !isLoading && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <div className="flex gap-3">
                    <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Insufficient Balance</p>
                      <p className="text-xs text-muted-foreground">
                        You need at least {ENTRY_FEE_USDC} USDC plus gas to enter this match. Current balance:{" "}
                        {formatUSDC(balance)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {paymentStatus === "success" && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <div className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Payment Successful!</p>
                      <p className="text-xs text-muted-foreground">Starting your match...</p>
                    </div>
                  </div>
                </div>
              )}

              {paymentStatus === "error" && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <div className="flex gap-3">
                    <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Payment Failed</p>
                      <p className="text-xs text-muted-foreground">{errorMessage}</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter className="sm:justify-between">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isPaying}>
            Cancel
          </Button>
          <Button
            onClick={handlePayment}
            disabled={!isConnected || !isCorrectNetwork || !hasEnoughBalance || isPaying || paymentStatus === "success"}
          >
            {isPaying ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : paymentStatus === "success" ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Payment Complete
              </>
            ) : (
              `Pay ${ENTRY_FEE_USDC} USDC`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
