import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { serve } from "bun";
import { PrismaClient } from "./generated/prisma";
const bot = new Telegraf(process.env.BOT_TOKEN!);

bot.start((ctx) => {
  console.log(ctx.from);
  ctx.reply("Yo! welcome");
});
bot.launch();
serve({
  port: process.env.PORT || 3000,
  fetch() {
    return new Response("Bot is running ✅");
  },
});
