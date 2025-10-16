import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { prisma } from "./lib/db";
import { handleStart } from "./controllers/userController";
import nodeCron from "node-cron";

import {
  handleAddWallet,
  handleListWallets,
  handleBalances,
  handleGetTokens,
  handleTokenBalance,
  handleGetNfts,
} from "./controllers/walletController";
import {
  handleMenu,
  handleClear,
  setupBotCommands,
} from "./controllers/menuController";
import { handleTextMessage } from "./controllers/messageController";

const bot = new Telegraf(process.env.BOT_TOKEN!);

bot.start(handleStart);

bot.command("menu", handleMenu);
bot.command("clear", handleClear);
bot.command("add_wallet", handleAddWallet);
bot.command("list_wallets", handleListWallets);
bot.command("balances", handleBalances);
bot.command("alltokens", handleGetTokens);
bot.command("token_balance", handleTokenBalance);
bot.command("nfts", handleGetNfts);

bot.action("add_wallet", async (ctx) => {
  await ctx.answerCbQuery();
  await handleAddWallet(ctx);
});

bot.action("list_wallets", async (ctx) => {
  await ctx.answerCbQuery();
  await handleListWallets(ctx);
});

bot.on(message("text"), handleTextMessage);

setupBotCommands(bot);

bot.launch();

process.once("SIGINT", async () => {
  console.log("Received SIGINT, shutting down gracefully...");
  await prisma.$disconnect();
  bot.stop("SIGINT");
});

process.once("SIGTERM", async () => {
  console.log("Received SIGTERM, shutting down gracefully...");
  await prisma.$disconnect();
  bot.stop("SIGTERM");
});
