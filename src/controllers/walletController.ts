import { Context } from "telegraf";
import { addUserAction } from "../dbActions/user";
import {
  addUserWallet,
  getUserBalances,
  getUserWallets,
} from "../dbActions/wallet";

export async function handleAddWallet(ctx: Context) {
  await ctx.reply(
    "Enter you wallet address and nickname you want to give in the format address-nickname make no mistakes example: x6FkrapfDNfqBvhnDMU7V53K2kPYB1odvw29XMmzKu7LZ-metamask"
  );
  await addUserAction(ctx.from!.id, "creating_wallet");
}

export async function handleListWallets(ctx: Context) {
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

export async function processWalletCreation(ctx: Context, text: string) {
  const userId = ctx.from!.id;
  const [address, nickname] = text.split("-");

  if (!address || !nickname) {
    await ctx.reply("Invalid format,please follow the example");
    return;
  }

  if (address.length < 20) {
    await ctx.reply("Invalid address,please check and re-enter");
    return;
  }

  const success = await addUserWallet(userId, address, nickname);

  if (success) {
    await ctx.reply(`Wallet ${nickname} added successfully!`);
    await addUserAction(userId, "");
  } else {
    await ctx.reply(
      "Failed to add wallet,please try again later or We are using postgres to store data it might have faced cold start issue,please try after 5 min or funds us "
    );
  }
}

export async function handleBalances(ctx: Context) {
  await ctx.reply("Fetching balances for your wallets...");
  const balances = await getUserBalances(ctx.from!.id);
  let totalBalance = 0; 
  for (const b of balances) {
    const message = `
<b>💼 Wallet Details</b>\n
<b>🪪 Nickname:</b> <code>${b.nickname}</code>\n
<b>🔗 Address:</b> <code>${b.address}</code>\n
<b>💰 Balance:</b> <b>${b.balance}</b> SOL
    `;
    await ctx.reply(message, { parse_mode: "HTML" });
    totalBalance += parseFloat(b.balance);
  }
  await ctx.reply(`Total Balance Across All Wallets: ${totalBalance} SOL`);
}
