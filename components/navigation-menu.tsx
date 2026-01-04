"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, Trophy, Eye, Users, Gamepad2, BarChart3 } from "lucide-react"
import { useState } from "react"
import TournamentsDialog from "./tournaments-dialog"
import SpectatorMode from "./spectator-mode"
import Link from "next/link"

export default function NavigationMenu() {
  const [showTournaments, setShowTournaments] = useState(false)
  const [showSpectator, setShowSpectator] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Menu className="w-4 h-4" />
            Menu
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Navigation</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setShowTournaments(true)}>
            <Trophy className="w-4 h-4 mr-2" />
            Tournaments
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setShowSpectator(true)}>
            <Eye className="w-4 h-4 mr-2" />
            Spectate Game
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link href="/play?mode=single">
              <Gamepad2 className="w-4 h-4 mr-2" />
              Single Player
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href="/play?mode=multi">
              <Users className="w-4 h-4 mr-2" />
              Multiplayer
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link href="/#features">
              <BarChart3 className="w-4 h-4 mr-2" />
              Leaderboard
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialogs triggered from menu */}
      {showTournaments && <TournamentsDialog open={showTournaments} onOpenChange={setShowTournaments} />}
      {showSpectator && <SpectatorMode open={showSpectator} onOpenChange={setShowSpectator} />}
    </>
  )
}
