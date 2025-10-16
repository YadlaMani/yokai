import axios from "axios";
import { tokenString } from "../constants/tokens";

interface JupiterPriceResponse{
  [tokenId : string]: {
    "usdPrice": number,
    "blockId": number,
    "decimals": number,
    "priceChange24h": number
  }
}

const ALERT_THRESHOLDS = [5, 10, 15, 20, 25, 30, 40, 50];

export async function fetchTokenPrices(tokenIds: string[]): Promise<Map<string, { price: number; change24h: number }>> {
  try {
    const ids = tokenIds.join(",");
    const response = await axios.get<JupiterPriceResponse>(
      `https://lite-api.jup.ag/price/v3?ids=${ids}`
    );

    const priceMap = new Map<string, { price: number; change24h: number }>();
    
    for (const [tokenId, data] of Object.entries(response.data)) {
      if (data && data.usdPrice !== undefined) {
        const absChange = Math.abs(data.priceChange24h || 0);
        
        if (absChange >= Math.min(...ALERT_THRESHOLDS)) {
          priceMap.set(tokenId, {
            price: data.usdPrice,
            change24h: data.priceChange24h || 0,
          });
        }
      }
    }

    return priceMap;
  } catch (error) {
    console.error("Error fetching prices from Jupiter:", error);
    throw error;
  }
}