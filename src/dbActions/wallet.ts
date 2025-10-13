import { prisma } from "../lib/db";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID} from "@solana/spl-token";
import { programs } from "@metaplex/js";
import type { Context } from "telegraf";
import { getAssociatedTokenAddress } from "@solana/spl-token";
interface Balance {
  nickname: string;
  address: string;
  balance: string;
  difference: string;
}

const connection = new Connection(
  process.env.RPC_URL||"https://api.devnet.solana.com",
  "confirmed"
);

export async function getBalance(address: string): Promise<number> {
  try {
    const pubkey = new PublicKey(address);
    const lamports = await connection.getBalance(pubkey);
    const sol = lamports / LAMPORTS_PER_SOL;
    return sol;
  } catch (error) {
    console.error("Invalid address:", error);
    return 0;
  }
}

export const addUserWallet = async (
  telegramId: number,
  address: string,
  nickname: string
) => {
  try {
    await prisma.wallet.create({
      data: {
        address,
        nickname,
        telegramId: telegramId.toString(),
      },
    });
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false };
  }
};

export const getUserWallets = async (telegramId: number) => {
  try {
    const wallets = await prisma.wallet.findMany({
      where: { telegramId: telegramId.toString() },
    });
    return wallets;
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const getUserBalances = async (
  telegramId: number
): Promise<Balance[]> => {
  try {
    const wallets = await getUserWallets(telegramId);
    
    const balancePromises = wallets.map(async (wallet) => {
      const balance = await getBalance(wallet.address);
      const diff=balance-parseFloat(wallet.prevBalance);
      const add=await prisma.wallet.update({
        where: { id: wallet.id },
        data: { prevBalance: balance.toString() },
      })
      return {
        nickname: wallet.nickname,
        address: wallet.address,
        balance: balance.toString() || "0",
        difference: diff.toFixed(5).toString()
      };
    });
    const balances = await Promise.all(balancePromises);
    return balances;
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const getTokensInfo=async(ctx:Context,walletAddress:string):Promise<void>=>{
  try{
  const owner = new PublicKey(walletAddress);
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      owner,
      {
        programId: TOKEN_PROGRAM_ID,
      }
    );

    if (tokenAccounts.value.length === 0) {
      await ctx.reply("No tokens found for this wallet.");
      return;
    }

    const tokens = await Promise.all(
      tokenAccounts.value.map(async ({ account }) => {
        const parsedInfo = account.data.parsed.info;
        const mint = parsedInfo.mint;
        const balance = parsedInfo.tokenAmount.uiAmountString;

        let name = "N/A";
        let symbol = "N/A";
        try {
          const tokenMetadata = await programs.metadata.Metadata.findByMint(
            connection,
            new PublicKey(mint)
          );
          name = tokenMetadata.data.data.name.trim();
          symbol = tokenMetadata.data.data.symbol.trim();
        } catch {
          // no metadata, keep defaults
        }

        return { name, symbol, balance };
      })
    );

    let message = `📊 <b>Token Balances</b>\n\n<pre>`;
    message += `────────────────────────────────────\n`;
    message += `Name         Symbol    Balance\n`;
    message += `────────────────────────────────────\n`;

    for (const t of tokens) {
      if (t.balance == 0) continue;
      const name = t.name.padEnd(13);
      const symbol = t.symbol.padEnd(8);
      const balance = parseFloat(t.balance).toFixed(5);
      message += `${name} ${symbol} ${balance}\n`;
    }

    message += `────────────────────────────────────</pre>`;

    await ctx.reply(message, { parse_mode: "HTML" });
  } catch (err) {
    await ctx.reply(
      "❌ Failed to fetch token balances. Make sure the wallet address is valid."
    );
  }
}
 
export const getTokenBalances = async (ctx: Context, tokenMintAddress: string, telegramId: number) => {
  const wallets = await getUserWallets(telegramId);
  const results: any[] = [];

  try {
    for (const wallet of wallets) {
      const ata = await getAssociatedTokenAddress(
        new PublicKey(tokenMintAddress),      // mint (e.g. BONK)
        new PublicKey(wallet.address),        // wallet address
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      let balance;
      try {
        balance = await connection.getTokenAccountBalance(ata);
      } catch (err) {
        balance = { value: { uiAmount: 0, uiAmountString: "0" } };
      }

      results.push({
        wallet: `${wallet.address.slice(0,2)}...${wallet.address.slice(-3)}`,
        balance: balance.value.uiAmountString,
      });
    }
    await ctx.reply(`Token balances:\n${results.map(r => `${r.wallet}: ${r.balance}`).join('\n')}`);
    return results;
  } catch (err) {
    console.error("Error fetching token balances:", err);
    await ctx.reply("Failed to fetch token balances.");
  }
};