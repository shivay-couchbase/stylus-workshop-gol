import React, { useState, createContext, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ethers } from 'ethers';
import { formatAddress, copyToClipboard } from './utils/format';
import RustStylusNFTPage from './pages/RustStylusNFTPage';
import SolidityNFTPage from './pages/SolidityNFTPage';
import SolidityStylusNFTPage from './pages/SolidityStylusNFTPage';
import Footer from './components/Footer';

// Import contract constants
import { CONTRACT_ADDRESSES } from './config/contracts';

export const {
  RUST_NFT: RUST_NFT_CONTRACT_ADDRESS,
  SOLIDITY_NFT: SOLIDITY_NFT_CONTRACT_ADDRESS,
  SOLIDITY_AND_STYLUS_NFT: SOLIDITY_AND_STYLUS_NFT_CONTRACT_ADDRESS,
} = CONTRACT_ADDRESSES;

// Create provider helper function
export const getProvider = (): ethers.BrowserProvider => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  throw new Error('No injected provider found. Please install MetaMask or another Web3 provider.');
};

// Extended Window interface with ethereum
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      isConnected: () => boolean;
      request: (request: { method: string; params?: any[] }) => Promise<any>;
      selectedAddress?: string;
      chainId?: string;
      networkVersion?: string;
      on?: (event: string, callback: (...args: any[]) => void) => void;
      removeListener?: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}

// Create a context for the provider and signer
type Web3ContextType = {
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  address: string | null;
  chainId: number | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnected: boolean;
};

// Create a default provider that will be used before the real one is initialized
let defaultProvider: ethers.BrowserProvider | null = null;
if (typeof window !== 'undefined' && window.ethereum) {
  defaultProvider = new ethers.BrowserProvider(window.ethereum);
}

export const Web3Context = createContext<Web3ContextType>({
  provider: defaultProvider,
  signer: null,
  address: null,
  chainId: null,
  connect: async () => {},
  disconnect: () => {},
  isConnected: false,
});

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive
          ? 'bg-indigo-900 text-white'
          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
      }`}
    >
      {children}
    </Link>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const { address, isConnected, connect, disconnect } = React.useContext(Web3Context);
  
  const handleDisconnect = () => {
    disconnect();
    window.location.reload();
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white">
      <nav className="bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link to="/" className="text-white font-bold">Game of Life on Stylus</Link>
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  <NavLink to="/">Rust Stylus NFT</NavLink>
                  <NavLink to="/solidity">Solidity NFT</NavLink>
                  <NavLink to="/solidity-stylus">Solidity + Stylus NFT</NavLink>
                </div>
              </div>
            </div>
            <div className="flex items-center">
              {isConnected ? (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => address && copyToClipboard(address)}
                    className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                    title="Copy address"
                  >
                    {address ? formatAddress(address) : 'Connected'}
                  </button>
                  <button
                    onClick={handleDisconnect}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={connect}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}

const App = (): JSX.Element => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isDisconnecting, setIsDisconnecting] = useState<boolean>(false);
  const eventListeners = React.useRef<{type: string; callback: any; remove: () => void}[]>([]);

  // Initialize provider
  useEffect(() => {
    const initProvider = async () => {
      if (!window.ethereum) {
        console.warn('No injected provider found');
        return;
      }

      try {
        const prov = getProvider();
        setProvider(prov);
        
        // Check if already connected
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const newSigner = await prov.getSigner();
          const address = await newSigner.getAddress();
          const network = await prov.getNetwork();

          setSigner(newSigner);
          setAddress(address);
          setChainId(Number(network.chainId));
          setIsConnected(true);

          // Log current network info after connection
          function getNetworkName(chainId: number | null) {
            if (!chainId) return 'Unknown';
            switch (chainId) {
              case 1: return 'Ethereum Mainnet';
              case 42161: return 'Arbitrum One';
              case 421613: return 'Arbitrum Goerli';
              case 412346: return 'Arbitrum DevNode';
              default: return 'Unknown';
            }
          }
          const EXPECTED_CHAIN_ID = Number(network.chainId);
          console.log('--- Network Debug Info ---');
          console.log('Connected chainId:', Number(network.chainId));
          console.log('Connected network:', getNetworkName(Number(network.chainId)));
          console.log('Expected chainId:', EXPECTED_CHAIN_ID);
          console.log('Expected network:', getNetworkName(EXPECTED_CHAIN_ID));
          console.log('Expected and connected network match.');
        }
      } catch (error) {
        console.error('Failed to initialize provider:', error);
      }
    };

    initProvider();
  }, []);

  const disconnect = useCallback(async (): Promise<void> => {
    console.log('Disconnecting wallet...');
    setIsDisconnecting(true);
    
    try {
      // Clear all event listeners first
      console.log('Removing event listeners...');
      eventListeners.current.forEach(({ type, remove }) => {
        console.log(`Removing ${type} listener`);
        try {
          remove();
        } catch (e) {
          console.error(`Error removing ${type} listener:`, e);
        }
      });
      eventListeners.current = [];
      
      // Clear state
      console.log('Clearing state...');
      setSigner(null);
      setAddress(null);
      setChainId(null);
      setIsConnected(false);
      localStorage.removeItem('walletAddress');
      
      console.log('Disconnect complete');
    } catch (error) {
      console.error('Error disconnecting:', error);
    } finally {
      // Small delay to prevent race conditions
      setTimeout(() => {
        console.log('Disconnection cleanup complete');
        setIsDisconnecting(false);
      }, 1000);
    }
  }, []);

  const handleAccountsChanged = useCallback(async (accounts: unknown) => {
    if (isDisconnecting) {
      console.log('Ignoring accountsChanged during disconnection');
      return;
    }
    
    if (!Array.isArray(accounts)) {
      console.log('Invalid accounts format:', accounts);
      return;
    }
    
    const accountAddresses = accounts as string[];
    console.log('Accounts changed:', accountAddresses);
    
    if (accountAddresses.length === 0) {
      // User disconnected all accounts
      console.log('No accounts, disconnecting...');
      await disconnect();
    } else if (isConnected) {
      console.log('Updating account address to:', accountAddresses[0]);
      setAddress(accountAddresses[0]);
    }
  }, [disconnect, isConnected, isDisconnecting]);

  const handleChainChanged = useCallback((..._args: unknown[]) => {
    // Reload the page when the chain changes
    window.location.reload();
  }, []);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask or another Web3 provider');
      return;
    }
    
    // Make sure we have the latest provider instance
    const prov = getProvider();
    setProvider(prov);

    try {
      // Request account access if needed
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Get the provider and signer
      const prov = getProvider();
      const newSigner = await prov.getSigner();
      const address = await newSigner.getAddress();
      const network = await prov.getNetwork();

      // Update state
      setProvider(prov);
      setSigner(newSigner);
      setAddress(address);
      setChainId(Number(network.chainId));
      setIsConnected(true);
      localStorage.setItem('walletAddress', address);
    } catch (error) {
      console.error('Error connecting to wallet:', error);
      // Don't throw the error to prevent unhandled promise rejection
      alert('Failed to connect wallet. Please check the console for details.');
    }
  }, []);

  // Set up event listeners when component mounts
  useEffect(() => {
    if (!window.ethereum) {
      console.warn('No ethereum provider found');
      return;
    }

    console.log('Setting up event listeners...');
    const ethereum = window.ethereum;
    
    // Type assertion to avoid TypeScript errors with the 'on' method
    const ethereumWithOn = ethereum as unknown as {
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };

    const accountsChangedHandler = (accounts: unknown) => {
      console.log('Raw accountsChanged event:', accounts);
      if (!isDisconnecting) {
        void handleAccountsChanged(accounts);
      } else {
        console.log('Skipping accountsChanged during disconnection');
      }
    };

    const chainChangedHandler = (...args: unknown[]) => {
      console.log('Chain changed:', args);
      if (!isDisconnecting) {
        handleChainChanged(...args);
      } else {
        console.log('Skipping chainChanged during disconnection');
      }
    };

    // Add event listeners
    ethereumWithOn.on('accountsChanged', accountsChangedHandler);
    ethereumWithOn.on('chainChanged', chainChangedHandler);

    // Store the remove functions so we can clean them up
    const removeAccountsListener = () => {
      console.log('Removing accountsChanged listener');
      ethereumWithOn.removeListener('accountsChanged', accountsChangedHandler);
    };
    
    const removeChainListener = () => {
      console.log('Removing chainChanged listener');
      ethereumWithOn.removeListener('chainChanged', chainChangedHandler);
    };
    
    // Store the listeners for cleanup
    eventListeners.current.push(
      { type: 'accountsChanged', callback: accountsChangedHandler, remove: removeAccountsListener },
      { type: 'chainChanged', callback: chainChangedHandler, remove: removeChainListener }
    );

    // Initial check
    const checkInitialConnection = async () => {
      try {
        const accounts = await ethereum.request({ method: 'eth_accounts' });
        console.log('Initial accounts check:', accounts);
        if (accounts.length > 0) {
          const newSigner = await provider?.getSigner();
          if (newSigner) {
            const address = await newSigner.getAddress();
            console.log('Found connected account:', address);
            setAddress(address);
            setIsConnected(true);
          }
        }
      } catch (error) {
        console.error('Error checking initial connection:', error);
      }
    };
    
    void checkInitialConnection();

    // Clean up event listeners on component unmount
    return () => {
      console.log('Cleaning up event listeners...');
      removeAccountsListener();
      removeChainListener();
      // Clear the stored listeners
      eventListeners.current = eventListeners.current.filter(
        listener => listener.callback !== accountsChangedHandler && listener.callback !== chainChangedHandler
      );
    };
  }, [handleAccountsChanged, handleChainChanged, isDisconnecting, provider]);

  // Check if wallet is already connected on component mount
  useEffect(() => {
    if (isDisconnecting) {
      console.log('Skipping connection check during disconnection');
      return;
    }

    let mounted = true;

    const checkIfWalletIsConnected = async () => {
      if (!mounted) return;
      
      if (!window.ethereum || !provider) {
        console.log('No ethereum provider or provider not ready');
        return;
      }

      try {
        console.log('Checking if wallet is connected...');
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        console.log('Current accounts:', accounts);
        
        if (!mounted) return;
        
        if (accounts.length > 0) {
          if (isConnected) {
            console.log('Wallet is connected, updating state...');
            const newSigner = await provider.getSigner();
            const address = await newSigner.getAddress();
            const network = await provider.getNetwork();

            // Update state in a single batch
            setSigner(newSigner);
            setAddress(address);
            setChainId(Number(network.chainId));
            // No need to set isConnected here as it's already set when we get the signer
            
            localStorage.setItem('walletAddress', address);
          } else {
            console.log('Wallet has accounts but we think we\'re disconnected - reconnecting...');
            setIsConnected(true);
          }
        } else if (isConnected) {
          console.log('No accounts but we think we\'re connected - disconnecting...');
          await disconnect();
        }
      } catch (error) {
        console.error('Error checking connected accounts:', error);
        if (isConnected) {
          await disconnect();
        }
      }
    };

    const timer = setTimeout(() => {
      void checkIfWalletIsConnected();
    }, 1000); // Add a small delay to allow state to settle

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [provider, isConnected, disconnect, isDisconnecting]);

  return (
    <Web3Context.Provider
      value={{
        provider: provider || defaultProvider!,
        signer,
        address,
        chainId,
        connect: connectWallet,
        disconnect,
        isConnected,
      }}
    >
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<RustStylusNFTPage />} />
            <Route path="/solidity" element={<SolidityNFTPage />} />
            <Route path="/solidity-stylus" element={<SolidityStylusNFTPage />} />
          </Routes>
        </Layout>
      </Router>
    </Web3Context.Provider>
  );
}

export default App;