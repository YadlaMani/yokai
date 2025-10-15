import { Context } from "telegraf";
import { getUserAction } from "../dbActions/user";
import {
  getTokens,
  processWalletCreation,
  tokenBalance,
} from "./walletController";

export async function handleTextMessage(ctx: Context) {
  if (!ctx.message || !("text" in ctx.message)) return;

  try {
    const userId = ctx.from!.id;
    const step = await getUserAction(userId);

    if (step === "creating_wallet") {
      const text = ctx.message.text.trim();
      await processWalletCreation(ctx, text);
    }

    console.log(step);

    if (step === "tokens") {
      const text = ctx.message.text.trim();
      await getTokens(ctx, text);
    }

    if (step === "token_balance") {
      const text = ctx.message.text.trim();
      await tokenBalance(ctx, text);
    }
  } catch (err) {
    console.error("Error handling text message:", err);
    await ctx.reply(
      "Something went sideways. Not your fault. The developer will eventually fix it."
    );
  }
}
