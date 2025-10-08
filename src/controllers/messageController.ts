import { Context } from "telegraf";
import { getUserAction } from "../dbActions/user";
import { processWalletCreation } from "./walletController";

export async function handleTextMessage(ctx: Context) {
  if (!ctx.message || !('text' in ctx.message)) return;
  
  const userId = ctx.from!.id;
  const step = await getUserAction(userId);
  
  if (step === "creating_wallet") {
    const text = ctx.message.text.trim();
    await processWalletCreation(ctx, text);
  }
}