// Define custom Stylus chain
import { defineChain } from 'viem'

export const nitroDevnet = defineChain({
  id: 412346,
  name: 'Arbitrum Nitro Devnet',
  network: 'arbitrum-nitro-devnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { 
      // In Codespaces: use the forwarded URL from the Ports tab for browser/wallet connections. For CLI tools inside the Codespace terminal, localhost works.
      http: ['http://localhost:8547'],
      // In Codespaces: use the forwarded WebSocket URL from the Ports tab for browser/wallet connections. For CLI tools inside the Codespace terminal, localhost works.
      webSocket: ['ws://localhost:8547']
    },
    public: { 
      // In Codespaces: use the forwarded URL from the Ports tab for browser/wallet connections. For CLI tools inside the Codespace terminal, localhost works.
      http: ['http://localhost:8547'],
      // In Codespaces: use the forwarded WebSocket URL from the Ports tab for browser/wallet connections. For CLI tools inside the Codespace terminal, localhost works.
      webSocket: ['ws://localhost:8547']
    },
  },
  testnet: true,
})