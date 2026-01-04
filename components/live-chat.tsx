"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, MessageCircle } from "lucide-react"
import { useWeb3 } from "@/lib/web3-provider"

interface ChatMessage {
  id: string
  sender: string
  senderAddress: string
  message: string
  timestamp: number
}

interface LiveChatProps {
  gameId?: string | null
  gameMode: "single" | "multi"
}

export default function LiveChat({ gameId, gameMode }: LiveChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState("")
  const { account } = useWeb3()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    if (gameMode === "single") {
      return
    }

    if (gameId && typeof window !== "undefined") {
      const stored = localStorage.getItem(`chat_${gameId}`)
      if (stored) {
        setMessages(JSON.parse(stored))
      }

      const interval = setInterval(() => {
        const updated = localStorage.getItem(`chat_${gameId}`)
        if (updated) {
          setMessages(JSON.parse(updated))
        }
      }, 2000)

      return () => clearInterval(interval)
    }
  }, [gameId, gameMode])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = () => {
    if (!inputValue.trim() || !account || !gameId) return

    const newMessage: ChatMessage = {
      id: `${Date.now()}_${Math.random()}`,
      sender: `${account.slice(0, 6)}...${account.slice(-4)}`,
      senderAddress: account,
      message: inputValue.trim(),
      timestamp: Date.now(),
    }

    const updatedMessages = [...messages, newMessage]
    setMessages(updatedMessages)

    if (typeof window !== "undefined") {
      localStorage.setItem(`chat_${gameId}`, JSON.stringify(updatedMessages))
    }

    setInputValue("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (gameMode === "single") {
    return null
  }

  if (!isExpanded) {
    return (
      <Card className="p-4">
        <Button variant="outline" className="w-full gap-2 bg-transparent" onClick={() => setIsExpanded(true)}>
          <MessageCircle className="w-4 h-4" />
          Open Chat
        </Button>
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          <h3 className="font-serif font-semibold">Live Chat</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setIsExpanded(false)}>
          Minimize
        </Button>
      </div>

      <ScrollArea className="h-64 mb-3 border rounded-lg p-3 bg-muted/30" ref={scrollRef}>
        <div className="space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((msg) => {
              const isOwnMessage = msg.senderAddress.toLowerCase() === account?.toLowerCase()
              return (
                <div key={msg.id} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      isOwnMessage ? "bg-primary text-primary-foreground" : "bg-card border border-border"
                    }`}
                  >
                    <div className="text-xs opacity-70 mb-1">{msg.sender}</div>
                    <div className="text-sm break-words">{msg.message}</div>
                    <div className="text-xs opacity-60 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </ScrollArea>

      <div className="flex gap-2">
        <Input
          placeholder="Type a message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={!account}
        />
        <Button onClick={handleSendMessage} disabled={!inputValue.trim() || !account} size="icon">
          <Send className="w-4 h-4" />
        </Button>
      </div>

      {!account && <p className="text-xs text-muted-foreground mt-2">Connect wallet to chat</p>}
    </Card>
  )
}
