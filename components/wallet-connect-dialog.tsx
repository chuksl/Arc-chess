"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Wallet } from "lucide-react"
import { useWeb3 } from "@/lib/web3-provider"

type WalletType = "metamask" | "walletconnect" | "coinbase"

interface WalletOption {
  id: WalletType
  name: string
  icon: string
  description: string
  detectFunction: () => boolean
}

export default function WalletConnectDialog() {
  const [open, setOpen] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const { connect } = useWeb3()

  const walletOptions: WalletOption[] = [
    {
      id: "metamask",
      name: "MetaMask",
      icon: "🦊",
      description: "Connect using MetaMask browser extension",
      detectFunction: () => typeof window !== "undefined" && window.ethereum?.isMetaMask,
    },
    {
      id: "coinbase",
      name: "Coinbase Wallet",
      icon: "🔷",
      description: "Connect using Coinbase Wallet",
      detectFunction: () => typeof window !== "undefined" && window.ethereum?.isCoinbaseWallet,
    },
    {
      id: "walletconnect",
      name: "WalletConnect",
      icon: "🔗",
      description: "Scan QR code with your mobile wallet",
      detectFunction: () => true, // WalletConnect is always available
    },
  ]

  const handleConnect = async (walletType: WalletType) => {
    setIsConnecting(true)
    try {
      await connect(walletType)
      setTimeout(() => {
        setOpen(false)
      }, 500)
    } catch (error) {
      console.error("[v0] Error connecting wallet:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Wallet className="w-4 h-4 mr-2" />
          Connect Wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Your Wallet</DialogTitle>
          <DialogDescription>Choose your preferred wallet to connect to Arc Testnet</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-4">
          {walletOptions.map((wallet) => {
            const isAvailable = wallet.detectFunction()
            return (
              <button
                key={wallet.id}
                onClick={() => handleConnect(wallet.id)}
                disabled={isConnecting || !isAvailable}
                className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
              >
                <span className="text-3xl">{wallet.icon}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{wallet.name}</h3>
                  <p className="text-sm text-muted-foreground">{isAvailable ? wallet.description : "Not installed"}</p>
                </div>
                {isConnecting && (
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                )}
              </button>
            )
          })}
        </div>
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground">
            After connecting, your wallet will automatically switch to Arc Testnet. If you don't have the network
            configured, it will be added automatically.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
