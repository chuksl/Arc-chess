"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Trophy, Users, Clock, DollarSign, Crown, Zap } from "lucide-react"
import { useState, useEffect } from "react"
import {
  getAllTournaments,
  joinTournament,
  isPlayerInTournament,
  getTimeRemaining,
  type Tournament,
} from "@/lib/tournament-utils"
import { useWeb3 } from "@/lib/web3-provider"
import { getUserStats } from "@/lib/user-stats"
import { useToast } from "@/hooks/use-toast"

interface TournamentsDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export default function TournamentsDialog({
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
}: TournamentsDialogProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const { account, isConnected } = useWeb3()
  const { toast } = useToast()

  const open = externalOpen !== undefined ? externalOpen : internalOpen
  const setOpen = externalOnOpenChange || setInternalOpen

  useEffect(() => {
    const loadTournaments = () => {
      const allTournaments = getAllTournaments()
      setTournaments(allTournaments)
    }

    loadTournaments()
    const interval = setInterval(loadTournaments, 30000)

    return () => clearInterval(interval)
  }, [])

  const handleJoinTournament = (tournament: Tournament) => {
    if (!account) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to join tournaments",
        variant: "destructive",
      })
      return
    }

    if (isPlayerInTournament(tournament.id, account)) {
      toast({
        title: "Already Joined",
        description: "You're already registered for this tournament",
      })
      return
    }

    const userStats = getUserStats(account)
    const success = joinTournament(tournament.id, account, userStats.rating)

    if (success) {
      toast({
        title: "Tournament Joined!",
        description: `You've successfully joined ${tournament.name}`,
      })
      const updatedTournaments = getAllTournaments()
      setTournaments(updatedTournaments)
    } else {
      toast({
        title: "Join Failed",
        description: "Tournament is full or unavailable",
        variant: "destructive",
      })
    }
  }

  const activeTournaments = tournaments.filter((t) => t.status === "active")
  const upcomingTournaments = tournaments.filter((t) => t.status === "upcoming")

  if (externalOpen !== undefined) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif flex items-center gap-2">
              <Trophy className="w-6 h-6 text-primary" />
              Tournament Arena
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Active Tournaments */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-green-500" />
                <h3 className="text-lg font-serif font-semibold">Active Tournaments</h3>
              </div>
              <div className="grid gap-4">
                {activeTournaments.map((tournament) => (
                  <TournamentCard
                    key={tournament.id}
                    tournament={tournament}
                    onJoin={handleJoinTournament}
                    isJoined={account ? isPlayerInTournament(tournament.id, account) : false}
                    isConnected={isConnected}
                  />
                ))}
              </div>
            </div>

            {/* Upcoming Tournaments */}
            {upcomingTournaments.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <h3 className="text-lg font-serif font-semibold">Upcoming Tournaments</h3>
                </div>
                <div className="grid gap-4">
                  {upcomingTournaments.map((tournament) => (
                    <TournamentCard
                      key={tournament.id}
                      tournament={tournament}
                      onJoin={handleJoinTournament}
                      isJoined={account ? isPlayerInTournament(tournament.id, account) : false}
                      isConnected={isConnected}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Trophy className="w-4 h-4" />
          Tournaments
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" />
            Tournament Arena
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Active Tournaments */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-green-500" />
              <h3 className="text-lg font-serif font-semibold">Active Tournaments</h3>
            </div>
            <div className="grid gap-4">
              {activeTournaments.map((tournament) => (
                <TournamentCard
                  key={tournament.id}
                  tournament={tournament}
                  onJoin={handleJoinTournament}
                  isJoined={account ? isPlayerInTournament(tournament.id, account) : false}
                  isConnected={isConnected}
                />
              ))}
            </div>
          </div>

          {/* Upcoming Tournaments */}
          {upcomingTournaments.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-serif font-semibold">Upcoming Tournaments</h3>
              </div>
              <div className="grid gap-4">
                {upcomingTournaments.map((tournament) => (
                  <TournamentCard
                    key={tournament.id}
                    tournament={tournament}
                    onJoin={handleJoinTournament}
                    isJoined={account ? isPlayerInTournament(tournament.id, account) : false}
                    isConnected={isConnected}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function TournamentCard({
  tournament,
  onJoin,
  isJoined,
  isConnected,
}: {
  tournament: Tournament
  onJoin: (tournament: Tournament) => void
  isJoined: boolean
  isConnected: boolean
}) {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(tournament.endDate))

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeRemaining(tournament.endDate))
    }, 60000)

    return () => clearInterval(interval)
  }, [tournament.endDate])

  const spotsLeft = tournament.maxParticipants - tournament.currentParticipants
  const isFull = spotsLeft <= 0

  return (
    <Card className={`p-6 ${tournament.status === "active" ? "border-primary/50" : ""}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-start gap-3 mb-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Crown className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-serif font-semibold text-lg">{tournament.name}</h4>
              <p className="text-sm text-muted-foreground">{tournament.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              <div>
                <div className="text-xs text-muted-foreground">Entry</div>
                <div className="font-semibold">{tournament.entryFee} USDC</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <div>
                <div className="text-xs text-muted-foreground">Prize</div>
                <div className="font-semibold">{tournament.prizePool} USDC</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <div>
                <div className="text-xs text-muted-foreground">Players</div>
                <div className="font-semibold">
                  {tournament.currentParticipants}/{tournament.maxParticipants}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-500" />
              <div>
                <div className="text-xs text-muted-foreground">Time Left</div>
                <div className="font-semibold">{timeLeft}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {isJoined ? (
            <Button variant="outline" disabled className="bg-green-500/10 border-green-500">
              Joined
            </Button>
          ) : (
            <Button
              onClick={() => onJoin(tournament)}
              disabled={!isConnected || isFull || tournament.status !== "active"}
            >
              {!isConnected
                ? "Connect Wallet"
                : isFull
                  ? "Full"
                  : tournament.status === "upcoming"
                    ? "Starts Soon"
                    : "Join Tournament"}
            </Button>
          )}
          {spotsLeft > 0 && spotsLeft <= 5 && (
            <p className="text-xs text-yellow-600 dark:text-yellow-500 text-center">Only {spotsLeft} spots left!</p>
          )}
        </div>
      </div>
    </Card>
  )
}
