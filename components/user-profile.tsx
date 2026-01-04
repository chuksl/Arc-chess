"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, TrendingUp, Award, Target, Clock, User } from "lucide-react"
import { getUserStats, getWinRate, getGameHistory, type UserStats } from "@/lib/user-stats"
import { useWeb3 } from "@/lib/web3-provider"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function UserProfile() {
  const { account } = useWeb3()
  const [stats, setStats] = useState<UserStats | null>(null)

  useEffect(() => {
    if (account) {
      const userStats = getUserStats(account)
      setStats(userStats)
    }
  }, [account])

  if (!account || !stats) {
    return null
  }

  const winRate = getWinRate(stats)
  const recentGames = getGameHistory(account).slice(0, 10)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <User className="w-4 h-4" />
          Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">Player Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Wallet Info */}
          <Card className="p-4 bg-primary/5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Wallet Address</div>
                <div className="font-mono text-sm font-medium">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </div>
              </div>
            </div>
          </Card>

          {/* Rating */}
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Current Rating</div>
                <div className="text-4xl font-bold text-primary">{stats.rating}</div>
                <div className="text-xs text-muted-foreground mt-1">ELO Rating System</div>
              </div>
              <Award className="w-16 h-16 text-primary/30" />
            </div>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-4 h-4 text-green-500" />
                <div className="text-xs text-muted-foreground">Wins</div>
              </div>
              <div className="text-2xl font-bold text-green-500">{stats.wins}</div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-red-500" />
                <div className="text-xs text-muted-foreground">Losses</div>
              </div>
              <div className="text-2xl font-bold text-red-500">{stats.losses}</div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <div className="text-xs text-muted-foreground">Draws</div>
              </div>
              <div className="text-2xl font-bold text-blue-500">{stats.draws}</div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-purple-500" />
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
              <div className="text-2xl font-bold text-purple-500">{stats.totalGames}</div>
            </Card>
          </div>

          {/* Win Rate */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold">Win Rate</div>
              <div className="text-2xl font-bold text-primary">{winRate}%</div>
            </div>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary to-primary/60 h-full rounded-full transition-all duration-500"
                style={{ width: `${winRate}%` }}
              />
            </div>
          </Card>

          {/* Recent Games */}
          <Card className="p-6">
            <h3 className="text-lg font-serif font-semibold mb-4">Recent Games</h3>
            {recentGames.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No games played yet. Start playing to build your history!
              </div>
            ) : (
              <div className="space-y-2">
                {recentGames.map((game, index) => (
                  <div
                    key={`${game.gameId}-${index}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-card border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          game.result === "win" ? "bg-green-500" : game.result === "loss" ? "bg-red-500" : "bg-blue-500"
                        }`}
                      />
                      <div>
                        <div className="text-sm font-medium capitalize">{game.result}</div>
                        <div className="text-xs text-muted-foreground">
                          vs {game.gameMode === "single" ? "AI" : "Player"}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">{new Date(game.timestamp).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
