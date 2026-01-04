// Web3 and Arc Network configuration

export const ARC_TESTNET_CONFIG = {
  chainId: "0x4CEF52", // Chain ID 5042002 in hexadecimal (was incorrectly 0x4CF252)
  chainName: "ARC",
  nativeCurrency: {
    name: "USDC",
    symbol: "USDC",
    decimals: 18, // Native USDC uses 18 decimals on Arc
  },
  rpcUrls: ["https://5042002.rpc.thirdweb.com", "https://rpc.testnet.arc.network"],
  blockExplorerUrls: ["https://testnet.arcscan.app"],
}

// Entry fee: 0.01 USDC
export const ENTRY_FEE_USDC = "0.01"

// Platform wallet address to receive entry fees
export const PLATFORM_WALLET_ADDRESS = "0x89b94e60D3acbBF238Db885bf69D4872d5b5ca9E"

// Note: USDC is the native token on Arc, like ETH on Ethereum
// We use native transfers (sendTransaction with value) instead of ERC-20 contract calls
// This avoids compatibility issues with browser wallets and the precompiled USDC contract
