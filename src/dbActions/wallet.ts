import { prisma } from "../lib/db";
export const addUserWallet = async (
  telegramId: number,
  address: string,
  nickname: string
) => {
  try {
    const wallet = await prisma.wallet.create({
      data: {
        address,
        nickname,
        telegramId: telegramId.toString(),
      },
    });
    return {
      success: true,
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
    };
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