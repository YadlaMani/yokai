import { Telegraf, Markup, Context } from "telegraf";
import { message } from "telegraf/filters";
import {
  storeNewUser,
  addUserAction,
  getUserAction,
  addUserWallet,
  getUserWallets,
} from "./dbActions/user";

const bot = new Telegraf(process.env.BOT_TOKEN!);

async function handleAddWallet(ctx: Context) {
  await ctx.reply(
    "Enter you wallet address and nickname you want to give in the format address-nickname make no mistakes example: x6FkrapfDNfqBvhnDMU7V53K2kPYB1odvw29XMmzKu7LZ-metamask"
  );
  await addUserAction(ctx.from!.id, "creating_wallet");
}

async function handleListWallets(ctx: Context) {
  await ctx.reply("Here are the wallets you have");
  const wallets = await getUserWallets(ctx.from!.id);
  if (wallets && wallets.length > 0) {
    wallets.forEach((wallet) => {
      ctx.reply(`Nickname: ${wallet.nickname}\nAddress: ${wallet.address}`);
    });
  } else {
    ctx.reply("You have no wallets added yet.");
  }
}

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
      [Markup.button.callback("My Wallets", "list_wallets")],
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

bot.command("add_wallet", handleAddWallet);
bot.command("list_wallets", handleListWallets);

bot.action("add_wallet", async (ctx) => {
  await ctx.answerCbQuery();
  await handleAddWallet(ctx);
});

bot.action("list_wallets", async (ctx) => {
  await ctx.answerCbQuery();
  await handleListWallets(ctx);
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

async function setTelegrafCommands() {
  await bot.telegram.setMyCommands([
    { command: "start", description: "Start the bot" },
    { command: "menu", description: "Show the menu" },
    { command: "clear", description: "Clear chat" },
    { command: "add_wallet", description: "Add a new wallet" },
    { command: "list_wallets", description: "List all wallets" },
  ]);
}
setTelegrafCommands();

bot.launch();
