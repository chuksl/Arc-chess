"use client"

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react"
import { ethers } from "ethers"
import { ARC_TESTNET_CONFIG } from "./web3-config"

interface Web3ContextType {
  account: string | null
  chainId: string | null
  isConnected: boolean
  isCorrectNetwork: boolean
  connect: (walletType: string) => Promise<void>
  disconnect: () => void
  switchToArcNetwork: () => Promise<void>
  provider: ethers.BrowserProvider | null
  signer: ethers.Signer | null
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

export function Web3Provider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null)
  const [chainId, setChainId] = useState<string | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.Signer | null>(null)

  const isNetworkSwitchPending = useRef(false)
  const networkSwitchPromise = useRef<Promise<void> | null>(null)

  const isConnected = account !== null
  const isCorrectNetwork = (() => {
    if (!chainId) return false
    try {
      const currentChainDecimal = Number.parseInt(chainId, 16)
      const expectedChainDecimal = Number.parseInt(ARC_TESTNET_CONFIG.chainId, 16)
      return currentChainDecimal === expectedChainDecimal
    } catch {
      return false
    }
  })()

  useEffect(() => {
    if (!isConnected) return

    const checkNetwork = async () => {
      if (typeof window !== "undefined" && window.ethereum && provider) {
        try {
          const network = await provider.getNetwork()
          const hexChainId = "0x" + network.chainId.toString(16)

          const currentDecimal = Number.parseInt(hexChainId, 16)
          const expectedDecimal = Number.parseInt(ARC_TESTNET_CONFIG.chainId, 16)

          console.log("[v0] Network check:", {
            currentChainId: hexChainId,
            currentDecimal,
            expectedChainId: ARC_TESTNET_CONFIG.chainId,
            expectedDecimal,
            isCorrect: currentDecimal === expectedDecimal,
          })

          if (hexChainId.toLowerCase() !== chainId?.toLowerCase()) {
            setChainId(hexChainId)
          }
        } catch (error) {
          if (error instanceof Error) {
            // Ignore "network changed" errors - these are expected during network switching
            if (error.message.includes("network changed")) {
              return
            }
            // Ignore origin mismatch warnings
            if (error.message.includes("origins don't match")) {
              return
            }
          }
        }
      }
    }

    checkNetwork()

    const interval = setInterval(checkNetwork, 3000)

    return () => clearInterval(interval)
  }, [isConnected, provider, chainId])

  useEffect(() => {
    checkConnection()
    setupListeners()

    return () => {
      removeListeners()
    }
  }, [])

  const checkConnection = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const web3Provider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await web3Provider.listAccounts()

        if (accounts.length > 0) {
          const network = await web3Provider.getNetwork()
          const hexChainId = "0x" + network.chainId.toString(16)
          setAccount(accounts[0].address)
          setChainId(hexChainId)
          setProvider(web3Provider)

          const web3Signer = await web3Provider.getSigner()
          setSigner(web3Signer)

          const currentDecimal = Number.parseInt(hexChainId, 16)
          const expectedDecimal = Number.parseInt(ARC_TESTNET_CONFIG.chainId, 16)

          console.log("[v0] Initial connection:", {
            account: accounts[0].address,
            chainId: hexChainId,
            chainIdDecimal: currentDecimal,
            expectedChainId: ARC_TESTNET_CONFIG.chainId,
            expectedDecimal,
            isCorrectNetwork: currentDecimal === expectedDecimal,
          })
        }
      } catch (error) {
        if (error instanceof Error && !error.message.includes("origins don't match")) {
          console.error("Error checking connection:", error)
        }
      }
    }
  }

  const setupListeners = () => {
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)
    }
  }

  const removeListeners = () => {
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
      window.ethereum.removeListener("chainChanged", handleChainChanged)
    }
  }

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnect()
    } else {
      setAccount(accounts[0])
    }
  }

  const handleChainChanged = async (newChainId: string) => {
    const currentDecimal = Number.parseInt(newChainId, 16)
    const expectedDecimal = Number.parseInt(ARC_TESTNET_CONFIG.chainId, 16)

    console.log("[v0] Chain changed event:", {
      newChainId,
      currentDecimal,
      expectedChainId: ARC_TESTNET_CONFIG.chainId,
      expectedDecimal,
      match: currentDecimal === expectedDecimal,
    })

    setChainId(newChainId)

    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const web3Provider = new ethers.BrowserProvider(window.ethereum)
        setProvider(web3Provider)
        const web3Signer = await web3Provider.getSigner()
        setSigner(web3Signer)
      } catch (error) {
        console.error("Error updating provider after chain change:", error)
      }
    }
  }

  const connect = async (walletType = "metamask") => {
    if (typeof window === "undefined" || !window.ethereum) {
      alert("Please install MetaMask or another Web3 wallet")
      return
    }

    try {
      let web3Provider: ethers.BrowserProvider

      if (walletType === "coinbase" && window.ethereum.isCoinbaseWallet) {
        web3Provider = new ethers.BrowserProvider(window.ethereum)
      } else if (walletType === "walletconnect") {
        web3Provider = new ethers.BrowserProvider(window.ethereum)
      } else {
        web3Provider = new ethers.BrowserProvider(window.ethereum)
      }

      const accounts = await web3Provider.send("eth_requestAccounts", [])

      if (accounts.length > 0) {
        const network = await web3Provider.getNetwork()
        const hexChainId = "0x" + network.chainId.toString(16)
        setAccount(accounts[0])
        setChainId(hexChainId)
        setProvider(web3Provider)

        const web3Signer = await web3Provider.getSigner()
        setSigner(web3Signer)

        const currentDecimal = Number.parseInt(hexChainId, 16)
        const expectedDecimal = Number.parseInt(ARC_TESTNET_CONFIG.chainId, 16)

        console.log("[v0] Wallet connected:", {
          account: accounts[0],
          chainId: hexChainId,
          currentDecimal,
          expectedChainId: ARC_TESTNET_CONFIG.chainId,
          expectedDecimal,
          isCorrectNetwork: currentDecimal === expectedDecimal,
        })

        if (currentDecimal !== expectedDecimal) {
          console.log("[v0] Triggering automatic network switch...")
          // Use setTimeout to ensure wallet connection completes first
          setTimeout(async () => {
            await switchToArcNetwork()
          }, 100)
        }
      }
    } catch (error) {
      if (error instanceof Error && !error.message.includes("origins don't match")) {
        console.error("Error connecting wallet:", error)
      }
    }
  }

  const disconnect = () => {
    setAccount(null)
    setChainId(null)
    setProvider(null)
    setSigner(null)
  }

  const switchToArcNetwork = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      return
    }

    if (isNetworkSwitchPending.current) {
      return networkSwitchPromise.current
    }

    isNetworkSwitchPending.current = true

    const switchPromise = (async () => {
      try {
        console.log("[v0] Requesting network switch to Arc...")
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: ARC_TESTNET_CONFIG.chainId }],
        })

        console.log("[v0] Network switched successfully")
        setChainId(ARC_TESTNET_CONFIG.chainId)
      } catch (switchError: any) {
        console.log("[v0] Switch error:", switchError.code, switchError.message)

        if (switchError.code === 4902) {
          try {
            console.log("[v0] Adding Arc network...")
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [ARC_TESTNET_CONFIG],
            })

            console.log("[v0] Network added successfully")
            setChainId(ARC_TESTNET_CONFIG.chainId)
          } catch (addError: any) {
            console.log("[v0] Add error:", addError.code, addError.message)
          }
        }
      } finally {
        isNetworkSwitchPending.current = false
        networkSwitchPromise.current = null
      }
    })()

    networkSwitchPromise.current = switchPromise
    return switchPromise
  }

  const value = {
    account,
    chainId,
    isConnected,
    isCorrectNetwork,
    connect,
    disconnect,
    switchToArcNetwork,
    provider,
    signer,
  }

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
}

export function useWeb3() {
  const context = useContext(Web3Context)
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider")
  }
  return context
}

declare global {
  interface Window {
    ethereum?: any
  }
}
