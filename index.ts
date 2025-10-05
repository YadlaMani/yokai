import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { storeNewUser } from "./dbActions/user";

const bot = new Telegraf(process.env.BOT_TOKEN!);

bot.start(async (ctx) => {
  console.log(ctx.from);
  const { username, newUser } = await storeNewUser(
    ctx.from.id,
    ctx.from.username
  );
  if (username == "unknown") {
    ctx.reply(
      "Datbase is down,try again later developer forgot about the project"
    );
    return;
  }
  if (newUser) {
    ctx.reply(`Yo! welcome ${username} explore the bot using menu`);
  } else {
    ctx.reply(`Welcome back ${username} we missed you!`);
  }
});
bot.launch();
