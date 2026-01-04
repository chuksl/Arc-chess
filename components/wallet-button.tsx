"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle } from "lucide-react"
import { useWeb3 } from "@/lib/web3-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import WalletConnectDialog from "./wallet-connect-dialog"

export default function WalletButton() {
  const { account, isConnected, isCorrectNetwork, disconnect, switchToArcNetwork } = useWeb3()

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (!isConnected) {
    return <WalletConnectDialog />
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          {isCorrectNetwork ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <AlertCircle className="w-4 h-4 text-yellow-500" />
          )}
          {account && formatAddress(account)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Wallet</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex flex-col items-start gap-1">
          <span className="text-xs text-muted-foreground">Address</span>
          <span className="font-mono text-xs">{account}</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex flex-col items-start gap-1">
          <span className="text-xs text-muted-foreground">Network</span>
          <span className="text-xs">{isCorrectNetwork ? "Arc Testnet" : "Wrong Network"}</span>
        </DropdownMenuItem>
        {!isCorrectNetwork && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={switchToArcNetwork}>
              <AlertCircle className="w-4 h-4 mr-2" />
              Switch to Arc Testnet
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={disconnect} className="text-destructive">
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
