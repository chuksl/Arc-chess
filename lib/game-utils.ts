// Utility functions for game management

export function generateGameId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function formatGameId(id: string): string {
  return id.match(/.{1,4}/g)?.join("-") || id
}

export function shareGameLink(gameId: string): string {
  return `${window.location.origin}/play?mode=multi&invite=${gameId}`
}
