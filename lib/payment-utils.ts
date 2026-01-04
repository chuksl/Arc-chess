import { ethers } from "ethers"
import { PLATFORM_WALLET_ADDRESS } from "./web3-config"

// USDC is the native token on Arc
// Native balance uses 18 decimals (for gas precision)
// We need to convert 0.01 USDC to 18-decimal format
const USDC_AMOUNT = "0.01" // 0.01 USDC entry fee

export async function checkUSDCBalance(provider: ethers.BrowserProvider, address: string): Promise<string> {
  const maxRetries = 3
  let lastError: any = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log("[v0] Checking native USDC balance for:", address, `(attempt ${attempt + 1}/${maxRetries})`)

      const balance = await provider.getBalance(address)
      console.log("[v0] Native USDC balance (18 decimals):", balance.toString())

      const formattedBalance = ethers.formatEther(balance)
      console.log("[v0] USDC balance formatted:", formattedBalance)
      return formattedBalance
    } catch (error: any) {
      lastError = error

      // If it's a network change error, wait and retry
      if (error.message?.includes("network changed")) {
        console.log("[v0] Network changed during balance check, retrying...")
        // Wait before retry (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)))
        continue
      }

      // For other errors, log and return 0
      console.error("[v0] Error checking USDC balance:", error)
      return "0"
    }
  }

  // If all retries failed
  console.error("[v0] Failed to check balance after", maxRetries, "attempts:", lastError)
  return "0"
}

export async function payEntryFee(signer: ethers.Signer): Promise<{
  success: boolean
  txHash?: string
  error?: string
}> {
  try {
    const signerAddress = await signer.getAddress()
    console.log("[v0] Starting native USDC transfer from:", signerAddress)
    console.log("[v0] Sending to:", PLATFORM_WALLET_ADDRESS)

    const amountInWei = ethers.parseEther(USDC_AMOUNT)
    console.log("[v0] Payment amount:", {
      usdc: `${USDC_AMOUNT} USDC`,
      amountInWei: amountInWei.toString(),
      decimals: 18,
    })

    // Check if user has enough balance
    const provider = signer.provider
    if (!provider) {
      return { success: false, error: "Provider not available" }
    }

    const balance = await provider.getBalance(signerAddress)
    console.log("[v0] Current balance:", ethers.formatEther(balance), "USDC")

    // Need amount + gas (estimate ~0.01 USDC for gas)
    const gasBuffer = ethers.parseEther("0.01")
    const totalNeeded = amountInWei + gasBuffer

    if (balance < totalNeeded) {
      const balanceFormatted = ethers.formatEther(balance)
      return {
        success: false,
        error: `Insufficient USDC. You have ${balanceFormatted} USDC but need at least ${ethers.formatEther(totalNeeded)} USDC (${USDC_AMOUNT} payment + gas fees)`,
      }
    }

    // Get fee data for Arc network
    const feeData = await provider.getFeeData()
    const maxFeePerGas = feeData.maxFeePerGas || ethers.parseUnits("160", "gwei")
    const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas || ethers.parseUnits("2", "gwei")

    console.log("[v0] Sending native USDC transfer with params:", {
      to: PLATFORM_WALLET_ADDRESS,
      value: amountInWei.toString(),
      maxFeePerGas: maxFeePerGas.toString(),
      maxPriorityFeePerGas: maxPriorityFeePerGas.toString(),
    })

    const tx = await signer.sendTransaction({
      to: PLATFORM_WALLET_ADDRESS,
      value: amountInWei,
      maxFeePerGas: maxFeePerGas,
      maxPriorityFeePerGas: maxPriorityFeePerGas,
    })

    console.log("[v0] Transaction sent:", tx.hash)

    // Wait for confirmation
    const receipt = await tx.wait()

    if (receipt && receipt.status === 1) {
      console.log("[v0] Payment successful:", receipt.hash)
      console.log("[v0] Gas used:", receipt.gasUsed.toString())
      return {
        success: true,
        txHash: receipt.hash,
      }
    } else {
      console.error("[v0] Transaction failed:", receipt)
      return {
        success: false,
        error: "Transaction failed",
      }
    }
  } catch (error: any) {
    console.error("[v0] Error paying entry fee:", error)

    let errorMessage = error.message || "Payment failed"
    if (error.code === "INSUFFICIENT_FUNDS") {
      errorMessage = "Insufficient USDC for transaction and gas fees"
    } else if (error.code === "ACTION_REJECTED" || error.code === 4001) {
      errorMessage = "Transaction rejected by user"
    } else if (error.reason) {
      errorMessage = error.reason
    }

    return {
      success: false,
      error: errorMessage,
    }
  }
}

export function formatUSDC(amount: string): string {
  return `${Number.parseFloat(amount).toFixed(4)} USDC`
}
