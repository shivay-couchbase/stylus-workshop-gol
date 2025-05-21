import { createContext, ReactNode, useState, useContext } from 'react';
import { ethers } from 'ethers';

interface Web3ContextType {
  provider: ethers.JsonRpcProvider | ethers.BrowserProvider | null;
  signer: ethers.Wallet | ethers.JsonRpcSigner | null;
  address: string | null;
  chainId: number | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnected: boolean;
}

const Web3Context = createContext<Web3ContextType>({
  provider: null,
  signer: null,
  address: null,
  chainId: null,
  connect: async () => {},
  disconnect: () => {},
  isConnected: false,
});

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  const [provider, setProvider] = useState<ethers.JsonRpcProvider | ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Wallet | ethers.JsonRpcSigner | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const connect = async () => {
    if (!(window as any).ethereum) {
      alert('No injected wallet found. Please install MetaMask or another wallet.');
      return;
    }
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      setProvider(provider);
      setSigner(signer);
      setAddress(address);
      setChainId(Number(network.chainId));
      setIsConnected(true);
    } catch (err) {
      console.error('Failed to connect wallet:', err);
    }
  };

  const disconnect = () => {
    setAddress(null);
    setIsConnected(false);
    setSigner(null);
    setProvider(null);
    setChainId(null);
  };

  return (
    <Web3Context.Provider value={{ provider, signer, address, chainId, connect, disconnect, isConnected }}>
      {children}
    </Web3Context.Provider>
  );
};

export default Web3Provider;
