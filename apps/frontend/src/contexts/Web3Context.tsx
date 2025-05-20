import { createContext, ReactNode, useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';

// In Codespace replace with the RPC URL from the Codespace environment
const LOCAL_RPC = "http://localhost:8547";
// Replace with one of the funded test accounts private key
const LOCAL_PRIVATE_KEY = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";

interface Web3ContextType {
  provider: ethers.JsonRpcProvider | null;
  signer: ethers.Wallet | null;
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
  const [provider, setProvider] = useState<ethers.JsonRpcProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Wallet | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    const setup = async () => {
      const provider = new ethers.JsonRpcProvider(LOCAL_RPC);
      setProvider(provider);
      const wallet = new ethers.Wallet(LOCAL_PRIVATE_KEY, provider);
      setSigner(wallet);
      setAddress(wallet.address);
      const network = await provider.getNetwork();
      setChainId(Number(network.chainId));
      setIsConnected(true);
    };
    setup();
  }, []);

  const connect = async () => {};
  const disconnect = () => {};

  return (
    <Web3Context.Provider value={{ provider, signer, address, chainId, connect, disconnect, isConnected }}>
      {children}
    </Web3Context.Provider>
  );
};

export default Web3Provider;
