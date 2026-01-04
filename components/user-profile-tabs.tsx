"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, TrendingUp, Award, Target, Clock, User, Settings, Volume2, Eye, Palette } from "lucide-react"
import { getUserStats, getWinRate, getGameHistory, type UserStats } from "@/lib/user-stats"
import { useWeb3 } from "@/lib/web3-provider"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

export default function UserProfileTabs() {
  const { account } = useWeb3()
  const [stats, setStats] = useState<UserStats | null>(null)

  // Game Settings State
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [soundVolume, setSoundVolume] = useState([70])
  const [showMoveHints, setShowMoveHints] = useState(true)
  const [animationSpeed, setAnimationSpeed] = useState([50])
  const [boardHighlights, setBoardHighlights] = useState(true)
  const [autoQueen, setAutoQueen] = useState(false)

  useEffect(() => {
    if (account) {
      const userStats = getUserStats(account)
      setStats(userStats)

      // Load saved settings
      const savedSettings = localStorage.getItem(`settings_${account}`)
      if (savedSettings) {
        const settings = JSON.parse(savedSettings)
        setSoundEnabled(settings.soundEnabled ?? true)
        setSoundVolume([settings.soundVolume ?? 70])
        setShowMoveHints(settings.showMoveHints ?? true)
        setAnimationSpeed([settings.animationSpeed ?? 50])
        setBoardHighlights(settings.boardHighlights ?? true)
        setAutoQueen(settings.autoQueen ?? false)
      }
    }
  }, [account])

  useEffect(() => {
    if (account) {
      // Save settings whenever they change
      const settings = {
        soundEnabled,
        soundVolume: soundVolume[0],
        showMoveHints,
        animationSpeed: animationSpeed[0],
        boardHighlights,
        autoQueen,
      }
      localStorage.setItem(`settings_${account}`, JSON.stringify(settings))
    }
  }, [account, soundEnabled, soundVolume, showMoveHints, animationSpeed, boardHighlights, autoQueen])

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
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">Player Profile</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stats" className="gap-2">
              <Trophy className="w-4 h-4" />
              Statistics
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Game Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-6 mt-6">
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
                            game.result === "win"
                              ? "bg-green-500"
                              : game.result === "loss"
                                ? "bg-red-500"
                                : "bg-blue-500"
                          }`}
                        />
                        <div>
                          <div className="text-sm font-medium capitalize">{game.result}</div>
                          <div className="text-xs text-muted-foreground">
                            vs {game.gameMode === "single" ? "AI" : "Player"}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(game.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6 mt-6">
            {/* Audio Settings */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Volume2 className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-serif font-semibold">Audio Settings</h3>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sound-enabled">Sound Effects</Label>
                    <div className="text-xs text-muted-foreground">Enable game sound effects</div>
                  </div>
                  <Switch id="sound-enabled" checked={soundEnabled} onCheckedChange={setSoundEnabled} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="volume">Volume</Label>
                    <span className="text-sm text-muted-foreground">{soundVolume[0]}%</span>
                  </div>
                  <Slider
                    id="volume"
                    min={0}
                    max={100}
                    step={5}
                    value={soundVolume}
                    onValueChange={setSoundVolume}
                    disabled={!soundEnabled}
                  />
                </div>
              </div>
            </Card>

            {/* Gameplay Settings */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Settings className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-serif font-semibold">Gameplay</h3>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="move-hints">Move Hints</Label>
                    <div className="text-xs text-muted-foreground">Show legal move highlights</div>
                  </div>
                  <Switch id="move-hints" checked={showMoveHints} onCheckedChange={setShowMoveHints} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="board-highlights">Board Highlights</Label>
                    <div className="text-xs text-muted-foreground">Highlight selected pieces and moves</div>
                  </div>
                  <Switch id="board-highlights" checked={boardHighlights} onCheckedChange={setBoardHighlights} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-queen">Auto-Queen Promotion</Label>
                    <div className="text-xs text-muted-foreground">Automatically promote pawns to queens</div>
                  </div>
                  <Switch id="auto-queen" checked={autoQueen} onCheckedChange={setAutoQueen} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="animation-speed">Animation Speed</Label>
                    <span className="text-sm text-muted-foreground">
                      {animationSpeed[0] < 30 ? "Slow" : animationSpeed[0] > 70 ? "Fast" : "Normal"}
                    </span>
                  </div>
                  <Slider
                    id="animation-speed"
                    min={0}
                    max={100}
                    step={10}
                    value={animationSpeed}
                    onValueChange={setAnimationSpeed}
                  />
                </div>
              </div>
            </Card>

            {/* Visual Settings */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Palette className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-serif font-semibold">Visual Preferences</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-coords">Show Coordinates</Label>
                    <div className="text-xs text-muted-foreground">Display board coordinates (a-h, 1-8)</div>
                  </div>
                  <Switch id="show-coords" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="piece-shadows">Piece Shadows</Label>
                    <div className="text-xs text-muted-foreground">Add shadows to chess pieces</div>
                  </div>
                  <Switch id="piece-shadows" defaultChecked />
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-start gap-3">
                <Eye className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Settings Auto-Saved</p>
                  <p className="text-xs text-muted-foreground">
                    Your preferences are automatically saved to your wallet address
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
