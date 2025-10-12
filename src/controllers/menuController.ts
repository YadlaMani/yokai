import { Context, Markup, Telegraf } from "telegraf";

export async function handleMenu(ctx: Context) {
  await ctx.reply(
    "Here is the menu,we support take it or leave it",
    Markup.inlineKeyboard([
      [Markup.button.callback("Add Wallet", "add_wallet")],
      [Markup.button.callback("My Wallets", "list_wallets")],
    ])
  );
}

export async function handleClear(ctx: Context) {
  if (!ctx.message) return;

  let i = 0;
  while (true) {
    try {
      await ctx.deleteMessage(ctx.message.message_id - i++);
    } catch (e) {
      break;
    }
  }
}

export async function setupBotCommands(bot: Telegraf) {
  await bot.telegram.setMyCommands([
    { command: "start", description: "Start the bot" },
    { command: "menu", description: "Show the menu" },
    { command: "clear", description: "Clear chat" },
    { command: "add_wallet", description: "Add a new wallet" },
    { command: "list_wallets", description: "List all wallets" },
    { command: "balances", description: "Get balances of your wallets" },
    { command: "tokens", description: "Get token balances of your wallets" },
  ]);
}
