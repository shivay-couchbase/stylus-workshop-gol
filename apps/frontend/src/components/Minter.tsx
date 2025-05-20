import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../contexts/Web3Context';
import GameOfLifeNFTAbi from '../abi/GameOfLifeNFT.json';


interface TokenData {
  id: bigint;
  uri: string;
}

interface MinterProps {
  contractAddress: string;
  name: string;
}

const Minter: React.FC<MinterProps> = ({ contractAddress, name }) => {
  const { provider, signer, address: account, isConnected } = useWeb3();
  const [tokenData, setTokenData] = useState<TokenData[]>([]);
  const [balance, setBalance] = useState<bigint>(0n);
  const [isLoading, setIsLoading] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);


  // Get contract instance
  const getContract = useCallback(() => {
    if (!signer) return null;
    return new ethers.Contract(contractAddress, GameOfLifeNFTAbi, signer);
  }, [signer, contractAddress]);

  // Fetch user's minted NFTs
  const fetchUserMints = useCallback(async () => {
    if (!isConnected || !account || !provider) {
      console.error('Not connected or missing account/provider');
      return;
    }
    
    const contract = getContract();
    if (!contract) {
      console.error('No contract instance available');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);

      // Check if contract is deployed
      const code = await provider.getCode(contractAddress);
      if (code === '0x') {
        throw new Error('Contract not deployed at the specified address');
      }

      // Fetch Transfer logs for mints to this user (from zero address)
      const transferTopic = ethers.id('Transfer(address,address,uint256)');
      const logs = await provider.getLogs({
        address: contractAddress,
        fromBlock: 0,
        toBlock: 'latest',
        topics: [
          transferTopic,
          ethers.zeroPadValue('0x0000000000000000000000000000000000000000', 32), // from: zero address
          ethers.zeroPadValue(account, 32) // to: user's address
        ]
      });
      // tokenId is indexed and is topic[3]
      const tokenIds = logs.map(log => BigInt(log.topics[3]));
      setBalance(BigInt(tokenIds.length));

      if (tokenIds.length === 0) {
        setTokenData([]);
        setIsLoading(false);
        return;
      }

      // Fetch token URI for each tokenId
      const tokenDataPromises = tokenIds.map(async (id) => {
        try {
          const uri = await contract.tokenURI(id);
          return { id, uri };
        } catch (err) {
          console.warn(`Failed to fetch URI for token ${id.toString()}`, err);
          return null;
        }
      });
      const tokenDataResults = (await Promise.all(tokenDataPromises)).filter(Boolean) as TokenData[];
      setTokenData(tokenDataResults);
      setIsLoading(false);
      return;
      // (Old fallback logic and unreachable code removed)

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      setError(`Failed to fetch NFTs: ${errorMessage}`);
      setTokenData([]);
    } finally {
      setIsLoading(false);
    }
  }, [account, isConnected, signer, contractAddress, getContract]);

  // Mint NFT
  const handleMint = useCallback(async () => {
    if (!isConnected || !signer || !account) {
      setError('Connect your wallet first');
      return;
    }

    const contract = getContract();
    if (!contract) {
      setError('No contract available');
      return;
    }

    try {
      setError(null);
      setIsMinting(true);

      // Check if contract is deployed
      const code = await provider?.getCode(contractAddress);
      if (!code || code === '0x') {
        throw new Error(`No contract deployed at ${contractAddress}`);
      }

      const tx = await contract.mint();
      const receipt = await tx.wait();
      console.log('Minted NFT:', receipt)

      // Refresh the user's NFTs after a short delay
      setTimeout(() => fetchUserMints(), 2000);

    } catch (err: any) {

      if (err?.code === 4001) {
        setError('Transaction was rejected');
      } else if (err?.code === 'UNPREDICTABLE_GAS_LIMIT' || err?.message?.includes('execution reverted')) {
        setError('Mint failed - you may already own an NFT');
      } else {
        setError(`Mint failed: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setIsMinting(false);
    }
  }, [signer, account, isConnected, contractAddress, getContract, fetchUserMints, provider]);

  // Fetch mints on connect and after mint
  useEffect(() => {
    fetchUserMints();
    const interval = setInterval(fetchUserMints, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [fetchUserMints]);

  return (
    <div className="minter-container p-6 max-w-2xl mx-auto bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-2 text-center">Game of Life NFT Minter</h2>
{name && (
  <h3 className="text-lg font-semibold text-blue-300 mb-6 text-center">{name}</h3>
) }
      {!isConnected || !account ? (
        <div className="flex flex-col items-center">
          <p className="text-gray-300 text-center">Please connect your wallet to mint an NFT</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col items-center">
            <button
              onClick={handleMint}
              disabled={isMinting || !isConnected}
              className={`px-6 py-3 rounded-lg font-medium text-white ${
                isMinting || !isConnected
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } transition-colors`}
            >
              {isMinting ? 'Minting...' : 'Mint NFT'}
            </button>
            {error && <p className="mt-2 text-red-400 text-sm">{error}</p>}
          </div>

          {isLoading ? (
            <div className="text-center text-gray-400">Loading your NFTs...</div>
          ) : (
            <React.Fragment>
              {tokenData.length > 0 ? (
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Your NFTs ({balance.toString()}):
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tokenData.map(({ id, uri }) => (
                      <div key={id.toString()} className="bg-gray-700 p-4 rounded-lg">
                        <div 
                          className="aspect-square bg-white rounded mb-2 flex items-center justify-center overflow-hidden p-2"
                          dangerouslySetInnerHTML={{ __html: uri }}
                        />
                        <p className="text-white text-center">Token ID: {id.toString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-400">No NFTs found for your account.</p>
              )}
            </React.Fragment>
          )}
        </div>
      )}
    </div>
  );
};

export default Minter;
