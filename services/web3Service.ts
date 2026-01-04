
import { ARC_TESTNET_CONFIG } from "../constants";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const connectWallet = async () => {
  if (!window.ethereum) throw new Error("No crypto wallet found");
  
  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    await switchToArcNetwork();
    return accounts[0];
  } catch (error) {
    console.error("Wallet Connection Error:", error);
    throw error;
  }
};

export const switchToArcNetwork = async () => {
  if (!window.ethereum) return;

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: ARC_TESTNET_CONFIG.chainId }],
    });
  } catch (switchError: any) {
    // 4902 error code indicates the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [ARC_TESTNET_CONFIG],
        });
      } catch (addError) {
        console.error("Failed to add Arc network", addError);
      }
    }
  }
};

export const payMatchFee = async (address: string, amount: string) => {
  if (!window.ethereum) throw new Error("Wallet not connected");

  // In a real dApp, we would call the USDC contract's transfer or approve function.
  // Here we simulate a transaction to the Arc Testnet.
  const txParams = {
    from: address,
    to: '0x0000000000000000000000000000000000000000', // Dead address for burning/fee simulation
    value: '0x0', // 0 native tokens
    data: '0x', // No data
  };

  try {
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [txParams],
    });
    return txHash;
  } catch (error) {
    console.error("Transaction Error:", error);
    throw error;
  }
};
