// Token related types
export interface Token {
  symbol: string;
  name: string;
  tokenId: string;
}

// Wallet related types
export interface Balance {
  nickname: string;
  address: string;
  balance: string;
  difference: string;
}

// Price alert related types
export interface PriceAlertData {
  tokenSymbol: string;
  tokenName: string;
  tokenId: string;
  price: number;
  change24h: number;
  threshold: number;
}

// Jupiter API response types
export interface JupiterPriceResponse {
  [tokenId: string]: {
    usdPrice: number;
    blockId: number;
    decimals: number;
    priceChange24h: number;
  };
}
