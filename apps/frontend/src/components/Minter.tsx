import { useState, useEffect, useCallback, useContext } from 'react';
import { ethers } from 'ethers';
import { Web3Context } from '../App';
import GameOfLifeNFTAbi from '../abi/GameOfLifeNFT.json';
import { CONTRACT_ADDRESSES } from '../config/contracts';

// Default to Rust NFT contract address if none provided
const DEFAULT_CONTRACT_ADDRESS = CONTRACT_ADDRESSES.RUST_NFT;

interface MintProps {
  contractAddress?: `0x${string}`;
  name: string;
}

interface TokenData {
  id: bigint;
  uri: string;
  isPending?: boolean;
}

function Minter({ contractAddress = DEFAULT_CONTRACT_ADDRESS, name }: MintProps): JSX.Element {
  const { signer, isConnected, address: account } = useContext(Web3Context);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [tokenData, setTokenData] = useState<TokenData[]>([]);
  const [balance, setBalance] = useState<bigint>(0n);

  const getContract = useCallback(() => {
    if (!signer) return null;
    return new ethers.Contract(contractAddress, GameOfLifeNFTAbi, signer);
  }, [signer, contractAddress]);

  const fetchUserMints = useCallback(async () => {
    if (!isConnected || !account) return;
    const contract = getContract();
    if (!contract) return;

    try {
      setIsLoading(true);

      if (!signer?.provider) return;
      const transferTopic = ethers.id("Transfer(address,address,uint256)");
      if (!signer?.provider) return;
      const logs = await signer.provider.getLogs({
        address: contractAddress,
        fromBlock: 0,
        toBlock: 'latest',
        topics: [
          transferTopic,
          ethers.zeroPadValue("0x0000000000000000000000000000000000000000", 32),
          ethers.zeroPadValue(account, 32)
        ]
      });

      const tokenIds = logs.map(log => BigInt(log.topics[3]));
      setBalance(BigInt(tokenIds.length));

      if (tokenIds.length === 0) {
        setTokenData([]);
        return;
      }

      const uris = await Promise.all(
        tokenIds.map(async (id) => {
          try {
            const uri = await contract.tokenURI(id);
            return { id, uri };
          } catch (err) {
            console.warn(`Failed to fetch URI for token ${id.toString()}`, err);
            return null;
          }
        })
      );

      const validTokenData = uris.filter((t): t is TokenData => !!t);
      setTokenData(validTokenData);
    } catch (err) {
      console.error('Error fetching mints:', err);
      setError('Failed to fetch your NFTs');
    } finally {
      setIsLoading(false);
    }
  }, [account, isConnected, signer, contractAddress, getContract]);

  const handleMint = useCallback(async () => {
    if (!isConnected || !signer || !account) {
      setError('Connect wallet first');
      return;
    }

    try {
      setError(null);
      setIsMinting(true);

      const contract = getContract();
      if (!contract) throw new Error('No contract available');
      const code = await signer.provider?.getCode(contractAddress);
      if (!code || code === '0x') throw new Error(`No contract code at ${contractAddress}`);

      console.log('Sending mint tx from UI...');
      console.log('Signer:', signer);
      console.log('Signer provider:', signer?.provider);
      console.log('window.ethereum:', window.ethereum);
      console.log('Signer === window.ethereum signer:', signer.provider === window.ethereum);

      const tx = await contract.mint();
      console.log('Tx hash:', tx.hash);

      const receipt = await tx.wait();
      console.log('Confirmed in block:', receipt.blockNumber);

      if (receipt.status !== 1) throw new Error('Transaction reverted');

      await fetchUserMints();
    } catch (err: any) {
      console.error('Minting failed:', err);
      if (err?.code === 4001) setError('User rejected transaction');
      else if (err?.message?.includes('execution reverted')) setError('Mint failed — possibly already minted?');
      else setError(err?.message || 'Unknown error');
    } finally {
      setIsMinting(false);
    }
  }, [signer, account, isConnected, contractAddress, getContract, fetchUserMints]);

  useEffect(() => {
    if (isConnected && account && signer) {
      fetchUserMints();
    }
  }, [isConnected, account, signer, fetchUserMints]);

  return (
    <div className="minter-container p-6 max-w-2xl mx-auto bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">{name}</h2>

      {!isConnected || !account ? (
        <p className="text-gray-300 text-center">Please connect your wallet to mint an NFT</p>
      ) : (
        <div className="mint-section">
          <div className="flex flex-col items-center">
            <button
              onClick={handleMint}
              disabled={isMinting}
              className={`px-6 py-3 rounded-full text-white font-medium text-lg ${
                isMinting
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 transition-colors'
              }`}
            >
              {isMinting ? 'Minting...' : 'Mint NFT'}
            </button>

            <div className="mt-6 w-full">
              <div className="flex justify-between items-center p-4 bg-gray-700/50 rounded-lg">
                <span className="text-gray-300">Connected as:</span>
                <span className="text-indigo-300 font-mono text-sm">
                  {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : ''}
                </span>
              </div>

              <div className="mt-4 p-4 bg-gray-700/30 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Your NFTs:</span>
                  <span className="text-white font-medium">{balance.toString()}</span>
                </div>

                {isLoading && (
                  <div className="mt-2 text-center text-gray-400">Loading...</div>
                )}

                {tokenData.length > 0 && (
                  <ul className="token-grid mt-4 grid grid-cols-2 gap-4">
                    {tokenData.map(({ id, uri }) => (
                      <li key={id.toString()} className="token-item bg-gray-800 p-3 rounded-lg">
                        <div
                          className="token-image bg-white rounded overflow-hidden"
                          dangerouslySetInnerHTML={{ __html: uri }}
                        />
                        <span className="text-indigo-300 text-sm block text-center mt-2">#{id.toString()}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {error && (
              <div className="mt-4 w-full p-3 bg-red-900/30 border border-red-400 text-red-100 rounded-lg text-sm">
                {error}
              </div>
            )}

            {isMinting && (
              <div className="mt-4 flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-400 mr-2"></div>
                <span className="text-indigo-300">Transaction pending...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Minter;
