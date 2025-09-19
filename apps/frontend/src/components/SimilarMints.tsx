import React, { useState } from 'react';
import { SimilarMint } from '../services/vectorSearchService';

interface SimilarMintsProps {
  currentSvg: string;
  contract: string;
  tokenId: number;
  onClose: () => void;
}

const SimilarMints: React.FC<SimilarMintsProps> = ({ 
  currentSvg, 
  contract, 
  tokenId, 
  onClose 
}) => {
  const [similarMints, setSimilarMints] = useState<SimilarMint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const findSimilarMints = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { vectorSearchService } = await import('../services/vectorSearchService');
      const response = await vectorSearchService.findSimilarMints({
        svg: currentSvg,
        limit: 6
      });
      
      setSimilarMints(response.similar_mints);
    } catch (err) {
      console.error('Error finding similar mints:', err);
      setError('Failed to find similar mints. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    findSimilarMints();
  }, [currentSvg]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">
            Similar NFTs to Token #{tokenId}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {isLoading && (
          <div className="text-center text-gray-400 py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            Finding similar NFTs...
          </div>
        )}

        {error && (
          <div className="text-center text-red-400 py-4">
            {error}
            <button
              onClick={findSimilarMints}
              className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        )}

        {!isLoading && !error && similarMints.length > 0 && (
          <div>
            <p className="text-gray-300 mb-4">
              Found {similarMints.length} similar NFTs based on visual patterns:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {similarMints.map((mint, index) => (
                <div key={`${mint.contract}-${mint.tokenId}`} className="bg-gray-700 p-4 rounded-lg">
                  <div
                    className="aspect-square bg-white rounded mb-2 flex items-center justify-center overflow-hidden p-2"
                    dangerouslySetInnerHTML={{ __html: mint.svg }}
                  />
                  <div className="text-sm text-gray-300">
                    <p>Token ID: {mint.tokenId}</p>
                    <p>Owner: {mint.owner.slice(0, 6)}...{mint.owner.slice(-4)}</p>
                    <p>Similarity: {(mint.similarity_score * 100).toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isLoading && !error && similarMints.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            No similar NFTs found. This might be a unique pattern!
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimilarMints;
