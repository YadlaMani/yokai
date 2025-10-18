import { prisma } from "../lib/db";

export const getTrackedTokens = async (userId: string) => {
  try {
    const trackedTokens = await prisma.trackedToken.findMany({
      where: { userId },
    });
    return trackedTokens;
  } catch (err) {
    console.error("Error fetching tracked tokens:", err);
    return [];
  }
};

export const saveTrackedTokens = async (
  userId: string,
  tokenList: Array<{
    userId: string;
    tokenSymbol: string;
    tokenName: string;
    tokenId: string;
  }>
) => {
  try {
    await prisma.trackedToken.deleteMany({
      where: { userId },
    });

    await prisma.trackedToken.createMany({
      data: tokenList,
    });

    return { success: true };
  } catch (err) {
    console.error("Error saving tracked tokens:", err);
    return { success: false };
  }
};

export const getDistinctTrackedTokens = async () => {
  try {
    const trackedTokens = await prisma.trackedToken.findMany({
      distinct: ["tokenSymbol"],
      select: {
        tokenSymbol: true,
        tokenName: true,
        tokenId: true,
      },
    });
    return trackedTokens;
  } catch (err) {
    console.error("Error fetching distinct tracked tokens:", err);
    return [];
  }
};

export const getUsersTrackingToken = async (tokenId: string) => {
  try {
    const trackingUsers = await prisma.trackedToken.findMany({
      where: { tokenId },
      select: {
        id: true,
        userId: true,
        lastNotifiedPercentage: true,
      },
    });
    return trackingUsers;
  } catch (err) {
    console.error("Error fetching users tracking token:", err);
    return [];
  }
};

export const updateNotificationThreshold = async (
  id: string,
  threshold: number
) => {
  try {
    await prisma.trackedToken.update({
      where: { id },
      data: { lastNotifiedPercentage: threshold },
    });
    return { success: true };
  } catch (err) {
    console.error("Error updating notification threshold:", err);
    return { success: false };
  }
};

export const getTokensWithNotifications = async () => {
  try {
    const trackedTokens = await prisma.trackedToken.findMany({
      where: {
        lastNotifiedPercentage: {
          not: 0,
        },
      },
      distinct: ["tokenId"],
      select: {
        tokenId: true,
        tokenSymbol: true,
      },
    });
    return trackedTokens;
  } catch (err) {
    console.error("Error fetching tokens with notifications:", err);
    return [];
  }
};

export const resetTokenThresholds = async (tokenId: string) => {
  try {
    await prisma.trackedToken.updateMany({
      where: { tokenId },
      data: { lastNotifiedPercentage: 0 },
    });
    return { success: true };
  } catch (err) {
    console.error("Error resetting token thresholds:", err);
    return { success: false };
  }
};
