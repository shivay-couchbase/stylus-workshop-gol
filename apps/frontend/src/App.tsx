import { useState, useEffect } from 'react'
import { 
  createWalletClient, 
  createPublicClient,
  custom, 
  WalletClient,
  PublicClient,

} from 'viem'
import { localhost } from './constants'
import ETHBalance from './components/ETHBalance'
import Minter from './components/Minter'
import Footer from './components/Footer'
// Replace with your deployed contract address
const RUST_NFT_CONTRACT_ADDRESS = '0xa6e41ffd769491a42a6e5ce453259b93983a22ef'
const SOLIDITY_NFT_CONTRACT_ADDRESS = '0xA39FFA43ebA037D67a0f4fe91956038ABA0CA386'
const SOLIDITY_AND_STYLUS_NFT_CONTRACT_ADDRESS = '0xdB3F4Ecb0298238a19eC5AFD087C6d9dF8041919'

function App() {
  const [account, setAccount] = useState<string>('')
  const [walletClient, setWalletClient] = useState<WalletClient>()
  const [publicClient, setPublicClient] = useState<PublicClient>()
  
  useEffect(() => {
    if (typeof window.ethereum === 'undefined') return
    
    const client = createPublicClient({
      chain: localhost,
      transport: custom(window.ethereum)
    })
    setPublicClient(client)

    const connectWallet = async () => {
      const wallet = createWalletClient({
        chain: localhost,
        transport: custom(window.ethereum!)
      })
      const [address] = await wallet.requestAddresses()
      setAccount(address)
      setWalletClient(wallet)
    }
    
    connectWallet()
  }, [])

  return (
    <div className=" gradient-background  text-white">
      <div className='flex flex-col items-center justify-center'>
        <h1>The Power of Stylus</h1>
        <p>A Rust and Solidity Smart Contract Hands-On Workshop</p>
      </div>
      
      
      <div className="card">
        <ETHBalance publicClient={publicClient} account={account} />
        <div className='flex flex-col md:flex-row justify-between w-full gap-4'>
        <Minter
          name="Rust"
          walletClient={walletClient}
          publicClient={publicClient}
          account={account}
          contractAddress={RUST_NFT_CONTRACT_ADDRESS}
        />
        <Minter 
          name="Solidity"
          walletClient={walletClient}
          publicClient={publicClient}
          account={account}
          contractAddress={SOLIDITY_NFT_CONTRACT_ADDRESS}
        />
        </div>
        <Minter 
          name="Solidity + Stylus"
          walletClient={walletClient}
          publicClient={publicClient}
          account={account}
          contractAddress={SOLIDITY_AND_STYLUS_NFT_CONTRACT_ADDRESS}
        />
      </div>
      <Footer />
    </div>
  )
}

export default App

// Add type for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>
    }
  }
} 