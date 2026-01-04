"use client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Gamepad2, Users, Trophy } from "lucide-react"
import Link from "next/link"
import WalletButton from "@/components/wallet-button"
import ThemeToggle from "@/components/theme-toggle"
import UserProfileTabs from "@/components/user-profile-tabs"
import NavigationMenu from "@/components/navigation-menu"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Chess background pattern */}
      <div
        className="absolute inset-0 opacity-[0.08] dark:opacity-[0.12]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23000000' fillOpacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v6h6V4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: "30px 30px",
        }}
      />

      {/* Gradient overlay from top */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-background pointer-events-none" />

      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center">
              <Trophy className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold font-serif">ChessArc</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="#features" className="text-sm hover:text-primary transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm hover:text-primary transition-colors">
              How It Works
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <NavigationMenu />
            <UserProfileTabs />
            <ThemeToggle />
            <WalletButton />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32 relative">
        {/* Decorative chess pieces - subtle background elements */}
        <div className="absolute left-0 top-10 w-32 h-32 opacity-[0.06] dark:opacity-[0.10] text-foreground">
          <svg viewBox="0 0 100 100" fill="currentColor">
            <path d="M50 10 L40 30 L35 40 L30 50 L30 90 L70 90 L70 50 L65 40 L60 30 Z" />
          </svg>
        </div>
        <div className="absolute right-0 bottom-10 w-40 h-40 opacity-[0.06] dark:opacity-[0.10] text-foreground">
          <svg viewBox="0 0 100 100" fill="currentColor">
            <circle cx="50" cy="20" r="8" />
            <path d="M45 28 L40 40 L35 50 L30 60 L28 90 L72 90 L70 60 L65 50 L60 40 L55 28 Z" />
          </svg>
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
          <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight text-balance">
            The Complete Platform for Web3 Chess
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Play against advanced AI, challenge friends with multiplayer matches, and compete on the Arc network with
            real stakes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <Link href="/play">Start Playing</Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent" asChild>
              <Link href="#how-it-works">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Game Mode Cards */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card className="p-8 hover:shadow-lg transition-shadow">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Gamepad2 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-serif font-semibold">Single Player</h3>
              <p className="text-muted-foreground">
                Challenge our advanced AI opponent with multiple difficulty levels. Perfect your strategy and sharpen
                your skills.
              </p>
              <Button variant="secondary" className="w-full" asChild>
                <Link href="/play?mode=single">Play vs AI</Link>
              </Button>
            </div>
          </Card>

          <Card className="p-8 hover:shadow-lg transition-shadow">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-serif font-semibold">Multiplayer</h3>
              <p className="text-muted-foreground">
                Create matches with invite codes, connect your wallet, and compete with real stakes on the Arc network.
              </p>
              <Button variant="secondary" className="w-full" asChild>
                <Link href="/play?mode=multi">Create Match</Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-serif font-bold text-center mb-16">Built for Competitive Chess</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-primary">Advanced AI</div>
              <div className="text-sm text-muted-foreground">Powered by sophisticated chess algorithms</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-primary">0.01 USDC</div>
              <div className="text-sm text-muted-foreground">Entry fee for competitive matches</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-primary">Arc Network</div>
              <div className="text-sm text-muted-foreground">Fast, secure blockchain gaming</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="container mx-auto px-4 py-20 border-t border-border">
        <div className="max-w-3xl mx-auto space-y-12">
          <h2 className="text-4xl font-serif font-bold text-center">Start Playing in Minutes</h2>
          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
                <p className="text-muted-foreground">
                  Connect your Web3 wallet and automatically switch to the Arc Testnet network.
                </p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Choose Your Mode</h3>
                <p className="text-muted-foreground">
                  Play against AI for practice or create a multiplayer match with an invite code.
                </p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Pay & Play</h3>
                <p className="text-muted-foreground">
                  For multiplayer matches, pay 0.01 USDC entry fee and start your competitive game.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center">
                <Trophy className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-sm font-semibold">ChessArc</span>
            </div>
            <p className="text-sm text-muted-foreground">Web3 Chess Platform on Arc Network</p>
            <a
              href="https://x.com/LightGabriel5"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Contact on X
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
