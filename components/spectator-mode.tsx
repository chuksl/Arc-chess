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
import { Input } from "@/components/ui/input"
import { Eye } from "lucide-react"
import { useRouter } from "next/navigation"

interface SpectatorModeProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function SpectatorMode({ open: externalOpen, onOpenChange: externalOnOpenChange }: SpectatorModeProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [spectatorCode, setSpectatorCode] = useState("")
  const router = useRouter()

  const open = externalOpen !== undefined ? externalOpen : internalOpen
  const setOpen = externalOnOpenChange || setInternalOpen

  const handleSpectate = () => {
    if (spectatorCode.trim()) {
      router.push(`/spectate?code=${spectatorCode}`)
      setOpen(false)
      setSpectatorCode("")
    }
  }

  if (externalOpen !== undefined) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Spectate a Game</DialogTitle>
            <DialogDescription>
              Enter the spectator code provided by a player to watch their game in real-time.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              placeholder="Enter spectator code..."
              value={spectatorCode}
              onChange={(e) => setSpectatorCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSpectate()}
            />
            <Button onClick={handleSpectate} className="w-full" disabled={!spectatorCode.trim()}>
              Start Spectating
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="w-4 h-4 mr-2" />
          Spectate
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Spectate a Game</DialogTitle>
          <DialogDescription>
            Enter the spectator code provided by a player to watch their game in real-time.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <Input
            placeholder="Enter spectator code..."
            value={spectatorCode}
            onChange={(e) => setSpectatorCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSpectate()}
          />
          <Button onClick={handleSpectate} className="w-full" disabled={!spectatorCode.trim()}>
            Start Spectating
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SpectatorMode
