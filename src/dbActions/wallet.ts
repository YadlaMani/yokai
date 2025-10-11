import { prisma } from "../lib/db";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

interface Balance {
  nickname: string;
  address: string;
  balance: string;
  difference: string;
}

const connection = new Connection(
  "https://api.mainnet-beta.solana.com",
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
