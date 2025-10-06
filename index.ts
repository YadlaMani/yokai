import { Telegraf, Markup } from "telegraf";
import { message } from "telegraf/filters";
import {
  storeNewUser,
  addUserAction,
  getUserAction,
  addUserWallet,
} from "./dbActions/user";

const bot = new Telegraf(process.env.BOT_TOKEN!);

bot.start(async (ctx) => {
  console.log(ctx.from);
  const { username, newUser } = await storeNewUser(
    ctx.from.id,
    ctx.from.username
  );
  if (username == "unknown") {
    ctx.reply(
      "We are using postgres to store data it might have faced cold start issue,please try after 5 min or funds us"
    );
    return;
  }
  if (newUser) {
    ctx.reply(`Yo! welcome ${username} explore the bot using menu`);
  } else {
    ctx.reply(`Welcome back ${username} we missed you!`);
  }
});
bot.command("menu", async (ctx) => {
  await ctx.reply(
    "Here is the menu,we support take it or leave it",
    Markup.inlineKeyboard([
      [Markup.button.callback("Add Wallet", "add_wallet")],
      [Markup.button.callback("My Wallets", "my_wallets")],
    ])
  );
});
bot.command("clear", async (ctx) => {
  let i = 0;
  while (true) {
    try {
      await ctx.deleteMessage(ctx.message.message_id - i++);
    } catch (e) {
      break;
    }
  }
});
bot.action("add_wallet", async (ctx) => {
  ctx.reply(
    "Enter you wallet address and nickname you want to give in the fomrat address-nickname make no mistakes example: x6FkrapfDNfqBvhnDMU7V53K2kPYB1odvw29XMmzKu7LZ-metamask"
  );
  await addUserAction(ctx.from.id, "creating_wallet");
});
bot.action("my_wallets", async (ctx) => {
  ctx.reply("Here are the wallets you have");
});
bot.on(message("text"), async (ctx) => {
  const userId = ctx.from.id;
  const step = await getUserAction(userId);
  if (step === "creating_wallet") {
    const text = ctx.message.text.trim();
    const [address, nickname] = text.split("-");
    if (!address || !nickname) {
      ctx.reply("Invalid format,please follow the example");
      return;
    }
    if (address.length < 20) {
      ctx.reply("Invalid address,please check and re-enter");
      return;
    }
    const success = await addUserWallet(userId, address, nickname);
    if (success) {
      ctx.reply(`Wallet ${nickname} added successfully!`);
      await addUserAction(userId, "");
    } else {
      ctx.reply(
        "Failed to add wallet,please try again later or We are using postgres to store data it might have faced cold start issue,please try after 5 min or funds us "
      );
    }
  }
});
bot.launch();
