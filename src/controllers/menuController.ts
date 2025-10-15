import { Context, Markup, Telegraf } from "telegraf";

export async function handleMenu(ctx: Context) {
  try {
    await ctx.reply(
      "Here is the menu, we support take it or leave it.",
      Markup.inlineKeyboard([
        [Markup.button.callback("Add Wallet", "add_wallet")],
        [Markup.button.callback("My Wallets", "list_wallets")],
      ])
    );
  } catch (err) {
    await ctx.reply(
      "Something went wrong, not your fault this time. The developer will look at it."
    );
  }
}

export async function handleClear(ctx: Context) {
  if (!ctx.message) return;

  try {
    let i = 0;
    while (true) {
      try {
        await ctx.deleteMessage(ctx.message.message_id - i++);
      } catch {
        break;
      }
    }
  } catch (err) {
    await ctx.reply(
      "Couldn’t clear everything. Not your fault, developer’s problem."
    );
  }
}

export async function setupBotCommands(bot: Telegraf) {
  try {
    await bot.telegram.setMyCommands([
      { command: "start", description: "Start the bot" },
      { command: "menu", description: "Show the menu" },
      { command: "clear", description: "Clear chat" },
      { command: "add_wallet", description: "Add a new wallet" },
      { command: "list_wallets", description: "List all wallets" },
      { command: "balances", description: "Get balances of your wallets" },
      {
        command: "alltokens",
        description: "Get token balances of your wallets",
      },
      { command: "token_balance", description: "Get Balances" },
    ]);
  } catch (err) {
    console.error("Error setting up commands:", err);
  }
}
