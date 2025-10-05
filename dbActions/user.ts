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
