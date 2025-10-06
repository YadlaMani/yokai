import { PrismaClient } from "../generated/prisma";
const prisma = new PrismaClient();
export const storeNewUser = async (telegramId: number, username?: string) => {
  try {
    const user = await prisma.user.findFirst({
      where: { telegramId: telegramId.toString() },
    });
    if (user) {
      return {
        username: user.username,
        newUser: false,
      };
    }
    const newUser = await prisma.user.create({
      data: {
        telegramId: telegramId.toString(),
        username: username || "unknown",
      },
    });
    return {
      username: newUser.username,
      newUser: true,
    };
  } catch (err) {
    return {
      username: "unknown",
      newUser: false,
    };
    console.error(err);
  }
};
export const addUserAction = async (telegramId: number, action: string) => {
  try {
    const user = await prisma.user.update({
      where: { telegramId: telegramId.toString() },
      data: { action },
    });
    return user;
  } catch (err) {
    console.error(err);
  }
};
export const getUserAction = async (telegramId: number) => {
  try {
    const user = await prisma.user.findFirst({
      where: { telegramId: telegramId.toString() },
    });
    return user?.action;
  } catch (err) {
    console.error(err);
  }
};

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
