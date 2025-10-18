export interface Token {
  symbol: string;
  name: string;
  tokenId: string;
}

export interface Balance {
  nickname: string;
  address: string;
  balance: string;
  difference: string;
}

export interface PriceAlertData {
  tokenSymbol: string;
  tokenName: string;
  tokenId: string;
  price: number;
  change24h: number;
  threshold: number;
}

export interface JupiterPriceResponse {
  [tokenId: string]: {
    usdPrice: number;
    blockId: number;
    decimals: number;
    priceChange24h: number;
  };
}
