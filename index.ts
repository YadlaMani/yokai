import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { PrismaClient } from "./generated/prisma";
const bot = new Telegraf(process.env.BOT_TOKEN!);

bot.start((ctx) => {
  ctx.reply("Yo! welcome");
});
bot.launch();
