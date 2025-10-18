import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { prisma } from "./lib/db";
import { handleStart } from "./controllers/userController";
import nodeCron from "node-cron";

import { checkPriceChanges, resetNotificationThresholds } from "./controllers/cronController";

import {
  handleAddWallet,
  handleListWallets,
  handleBalances,
  handleGetTokens,
  handleTokenBalance,
  handleGetNfts,
  handleDeleteWallet,
} from "./controllers/walletController";
import {
  handleMenu,
  handleClear,
  setupBotCommands,
} from "./controllers/menuController";
import { handleTextMessage } from "./controllers/messageController";

import { handleTrackToken, handleTrackCancel, handleTrackSave, handleTrackToggle } from "./controllers/trackTokenController";

const bot = new Telegraf(process.env.BOT_TOKEN!);

bot.start(handleStart);

bot.command("menu", handleMenu);
bot.command("clear", handleClear);
bot.command("add_wallet", handleAddWallet);
bot.command("list_wallets", handleListWallets);
bot.command("delete_wallet", handleDeleteWallet);
bot.command("balances", handleBalances);
bot.command("alltokens", handleGetTokens);
bot.command("token_balance", handleTokenBalance);
bot.command("nfts", handleGetNfts);
bot.command("track_token_prices", handleTrackToken);

bot.action("add_wallet", async (ctx) => {
  await ctx.answerCbQuery();
  await handleAddWallet(ctx);
});

bot.action("list_wallets", async (ctx) => {
  await ctx.answerCbQuery();
  await handleListWallets(ctx);
});

bot.action("delete_wallet", async (ctx) => {
  await ctx.answerCbQuery();
  await handleDeleteWallet(ctx);
});

bot.action("balances", async (ctx) => {
  await ctx.answerCbQuery();
  await handleBalances(ctx);
});

bot.action("alltokens", async (ctx) => {
  await ctx.answerCbQuery();
  await handleGetTokens(ctx);
});

bot.action("token_balance", async (ctx) => {
  await ctx.answerCbQuery();
  await handleTokenBalance(ctx);
});

bot.action("nfts", async (ctx) => {
  await ctx.answerCbQuery();
  await handleGetNfts(ctx);
});

bot.action("track_token_prices", async (ctx) => {
  await ctx.answerCbQuery();
  await handleTrackToken(ctx);
});

bot.action("clear", async (ctx) => {
  await ctx.answerCbQuery();
  await handleClear(ctx);
});

bot.action(/^track_toggle_/, handleTrackToggle);
bot.action("track_save", handleTrackSave);
bot.action("track_cancel", handleTrackCancel);

bot.on(message("text"), handleTextMessage);

setupBotCommands(bot);

nodeCron.schedule("*/5 * * * *", async()=>{
  console.log("Runnning price check cron job!");
  await checkPriceChanges(bot);
});

nodeCron.schedule("0 * * * *", async()=>{
  console.log("Running hourly cleanup job for resetting thresholds!");
  await resetNotificationThresholds(); 
});

bot.launch();

setTimeout(async ()=>{
  console.log("Running initial price check on startup");
  await checkPriceChanges(bot);
}, 5000);

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
