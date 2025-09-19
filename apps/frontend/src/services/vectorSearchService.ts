// Vector Search API Service
// Use import.meta.env for Vite, or define REACT_APP_VECTOR_API_URL in your .env file for Create React App
// Use Vite environment variable for API base URL
const API_BASE_URL = import.meta.env.VITE_VECTOR_API_URL || 'http://localhost:8000';

export interface MintRequest {
  contract: string;
  tokenId: number;
  owner: string;
  svg: string;
}

export interface SimilarMint {
  contract: string;
  tokenId: number;
  owner: string;
  svg: string;
  similarity_score: number;
}

export interface SimilaritySearchRequest {
  svg: string;
  limit?: number;
}

export interface SimilaritySearchResponse {
  similar_mints: SimilarMint[];
}

class VectorSearchService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async storeMint(mintData: MintRequest): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/mints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mintData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error storing mint:', error);
      throw error;
    }
  }

  async findSimilarMints(searchData: SimilaritySearchRequest): Promise<SimilaritySearchResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/search/similar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error finding similar mints:', error);
      throw error;
    }
  }

  async getMint(contract: string, tokenId: number): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/mints/${contract}/${tokenId}`);

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting mint:', error);
      throw error;
    }
  }

  async getMintsByOwner(owner: string, limit: number = 10): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/mints/owner/${owner}?limit=${limit}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting mints by owner:', error);
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}

export const vectorSearchService = new VectorSearchService();
export default vectorSearchService;
