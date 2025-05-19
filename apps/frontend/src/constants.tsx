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
      http: ['http://localhost:8547'],
      webSocket: ['ws://localhost:8547']
    },
    public: { 
      http: ['http://localhost:8547'],
      webSocket: ['ws://localhost:8547']
    },
  },
  testnet: true,
})