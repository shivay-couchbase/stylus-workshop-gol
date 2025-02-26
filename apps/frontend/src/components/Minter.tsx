import { useState, useEffect } from 'react';
import { WalletClient, PublicClient, parseAbi } from 'viem';
import { localhost } from '../constants';

interface MintProps {
  name: string;
  walletClient?: WalletClient;
  publicClient?: PublicClient;
  account?: string;
  contractAddress: `0x${string}`;
}

const abi = parseAbi([
  'function mint() public',
  'function balanceOf(address owner) public view returns (uint256)',
  'function tokenURI(uint256 tokenId) public view returns (string)',
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)'
]);

interface TokenData {
  id: bigint;
  uri: string;
}


export default function Minter({ walletClient, publicClient, account, contractAddress, name }: MintProps) {
  const [userTokens, setUserTokens] = useState<bigint[]>([]);
  const [tokenData, setTokenData] = useState<TokenData[]>([]);
  const [balanceOf, setBalanceOf] = useState<bigint>(0n);

  useEffect(() => {
    const fetchUserMints = async () => {
      if (!publicClient || !account) return;

      try {
        const logs = await publicClient.getContractEvents({
          address: contractAddress,
          abi,
          eventName: 'Transfer',
          fromBlock: 0n,
          args: {
            from: '0x0000000000000000000000000000000000000000' as `0x${string}`,
            to: account as `0x${string}`
          }
        });
        console.log('logs', logs);

        const tokenIds = logs.map(log => log.args.tokenId!);
        setUserTokens(tokenIds);

        // Fetch URI for each token
        const tokenDataPromises = tokenIds.map(async (id) => {
          const uri = await publicClient.readContract({
            address: contractAddress,
            abi,
            functionName: 'tokenURI',
            args: [id]
          });
          return { id, uri };
        });

        const tokenDataResults = await Promise.all(tokenDataPromises);
        setTokenData(tokenDataResults);

        // Also fetch balance
        const balance = await publicClient.readContract({
          address: contractAddress,
          abi,
          functionName: 'balanceOf',
          args: [account as `0x${string}`]
        });
        setBalanceOf(balance);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserMints();
    const interval = setInterval(fetchUserMints, 5000);
    return () => clearInterval(interval);
  }, [account, publicClient]);

  const handleMint = async () => {
    if (!walletClient || !account) return;
    
    try {
      

      await walletClient.writeContract({
        address: contractAddress,
        abi,
        functionName: 'mint',
        account: account as `0x${string}`,
        args: [],
        chain: localhost
      });
    } catch (error) {
      console.error('Error minting:', error);
    }
  };

  return (
    <div className="mint-container">
      <h2>Game of Life - {name} Implementation ({contractAddress.slice(0, 6)}...{contractAddress.slice(-4)})</h2>
      <button 
        onClick={handleMint}
        className="mint-button"
      >
        Mint
      </button>
      
      {tokenData.length > 0 && (
        <div className="mt-8">
          <h3 className='highlight'>NFTs ({balanceOf.toString()}):</h3>
          <ul className="token-grid">
            {tokenData.map(({ id, uri }) => (
              <li key={id.toString()} className="token-item">
                <div 
                  className="token-image"
                  dangerouslySetInnerHTML={{ __html: uri }}
                />
                <span className="text-black text-sm highlight">{id.toString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 