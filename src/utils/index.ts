import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import axios from "axios";

export const connection = new Connection(
  process.env.RPC_URL || "https://api.devnet.solana.com",
  "confirmed"
);

export function isValidSolanaAddress(address: string): boolean {
  try {
    if (address.startsWith('0x') || address.startsWith('0X')) {
      return false;
    }

    if (address.length < 32 || address.length > 44) {
      return false;
    }

    const publicKey = new PublicKey(address);
    
    return publicKey.toBase58() === address;
  } catch (error) {
    return false;
  }
}

const options = {
  method: "GET",
  url: "https://solana-gateway.moralis.io/account/mainnet/64xKkdE93fvWnqy5U1qj3zTTAuaR36wGYR8uQC4cd61F/nft",
  params: {
    nftMetadata: "false",
    mediaItems: "false",
    excludeSpam: "true",
    includeFungibleAssets: "true",
  },
  headers: {
    accept: "application/json",
    "X-API-Key": process.env.MORALIS_API_KEY || "YOUR_MORALIS_API_KEY_HERE",
  },
};

export const fetchNftsForWallet = async (address: string) => {
  try {
    const response = await axios.request(options);
    return response.data;
  } catch (err) {
    console.error("Error fetching NFTs:", err);
    return [];
  }
};
