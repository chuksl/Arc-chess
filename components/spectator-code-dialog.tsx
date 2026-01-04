"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, Copy, Check } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface SpectatorCodeDialogProps {
  gameId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function SpectatorCodeDialog({ gameId, open, onOpenChange }: SpectatorCodeDialogProps) {
  const [spectatorCode, setSpectatorCode] = useState("")
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const generateSpectatorCode = () => {
    if (!gameId) return
    const code = `SPEC-${gameId}-${Math.random().toString(36).substring(7).toUpperCase()}`
    setSpectatorCode(code)

    if (typeof window !== "undefined") {
      localStorage.setItem(`spectator_${gameId}`, code)
    }
  }

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(spectatorCode)
      setCopied(true)
      toast({
        title: "Code Copied!",
        description: "Share this code with spectators",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please copy manually",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Spectator Mode
          </DialogTitle>
          <DialogDescription>Generate a code for spectators to watch your game</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!spectatorCode ? (
            <Button onClick={generateSpectatorCode} className="w-full">
              Generate Spectator Code
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input value={spectatorCode} readOnly className="font-mono" />
                <Button onClick={copyCode} size="icon" variant="outline">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Share this code with anyone who wants to watch your game. They can enter it on the home page to
                spectate.
              </p>
              <div className="p-3 bg-muted rounded-lg text-sm">
                <strong>Note:</strong> Spectators can only watch, they cannot make moves or chat.
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
