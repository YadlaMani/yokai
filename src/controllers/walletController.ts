import { Context } from "telegraf";
import { addUserAction } from "../dbActions/user";
import {
  addUserWallet,
  getTokensInfo,
  getUserBalances,
  getUserWallets,
} from "../dbActions/wallet";

export async function handleAddWallet(ctx: Context) {
  await ctx.reply(
    "Enter you wallet address and nickname you want to give in the format address-nickname make no mistakes example: x6FkrapfDNfqBvhnDMU7V53K2kPYB1odvw29XMmzKu7LZ-metamask"
  );
  await addUserAction(ctx.from!.id, "creating_wallet");
}

export async function handleGetTokens(ctx: Context) {
  await ctx.reply("Give me the wallet address to fetch token balances");
  await addUserAction(ctx.from!.id, "tokens");
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
  let totalDiff = 0;
  let message = `
<b>💼 Wallet Balances</b>\n
<pre>
Nickname    Address     Balance(SOL)  Last Visit
─────────────────────────────────────────────────────`;

  for (const b of balances) {
    const nicknamePadded = b.nickname.padEnd(10);
    const addressTruncated = `${b.address.slice(0, 3)}...${b.address.slice(
      -3
    )}`;
    const balanceTruncated = parseFloat(b.balance).toFixed(5);
    message += `\n${nicknamePadded} ${addressTruncated}     ${balanceTruncated}       ${
      parseFloat(b.difference) > 0
        ? `+${parseFloat(b.difference).toFixed(5)}`
        : `${parseFloat(b.difference).toFixed(5)}`
    }`;
    totalBalance += parseFloat(b.balance);
    totalDiff += parseFloat(b.difference);
  }

  message += `\n─────────────────────────────────────────────────────
Total Balance: ${parseFloat(totalBalance.toString()).toFixed(5)} SOL</pre>`;
  if (totalDiff > 0) {
    message += `\nTotal Change Since Last Visit: +${parseFloat(
      totalDiff.toString()
    ).toFixed(5)} SOL`;
  } else if (totalDiff < 0) {
    message += `\nTotal Change Since Last Visit: ${parseFloat(
      totalDiff.toString()
    ).toFixed(5)} SOL`;
  }

  await ctx.reply(message, { parse_mode: "HTML" });
}
export async function getTokens(ctx: Context, walletAddress: string) {
  await ctx.reply("Fetching token balances...");
  await getTokensInfo(ctx, walletAddress);
}
