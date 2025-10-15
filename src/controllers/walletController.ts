import { Context } from "telegraf";
import { addUserAction } from "../dbActions/user";
import {
  addUserWallet,
  getTokenBalances,
  getTokensInfo,
  getUserBalances,
  getUserWallets,
} from "../dbActions/wallet";

export async function handleAddWallet(ctx: Context) {
  try {
    await ctx.reply(
      "Enter your wallet address and nickname in this format: address-nickname. Example: x6FkrapfDNfqBvhnDMU7V53K2kPYB1odvw29XMmzKu7LZ-metamask"
    );
    await addUserAction(ctx.from!.id, "creating_wallet");
  } catch (err) {
    console.error("Error in handleAddWallet:", err);
    await ctx.reply(
      "Something broke. Not your fault, developer will fix it later."
    );
  }
}

export async function handleGetTokens(ctx: Context) {
  try {
    await ctx.reply("Send the wallet address to get token balances.");
    await addUserAction(ctx.from!.id, "tokens");
  } catch (err) {
    console.error("Error in handleGetTokens:", err);
    await ctx.reply(
      "Could not process request. Developer’s problem, not yours."
    );
  }
}

export async function handleListWallets(ctx: Context) {
  try {
    await ctx.reply("Here are your wallets:");
    const wallets = await getUserWallets(ctx.from!.id);

    if (wallets && wallets.length > 0) {
      wallets.forEach((wallet) => {
        ctx.reply(`Nickname: ${wallet.nickname}\nAddress: ${wallet.address}`);
      });
    } else {
      ctx.reply("You have no wallets added yet.");
    }
  } catch (err) {
    console.error("Error in handleListWallets:", err);
    await ctx.reply(
      "Can’t fetch wallets right now. Developer will take a look."
    );
  }
}

export async function processWalletCreation(ctx: Context, text: string) {
  try {
    const userId = ctx.from!.id;
    const [address, nickname] = text.split("-");

    if (!address || !nickname) {
      await ctx.reply("Wrong format, please follow the example given.");
      return;
    }

    if (address.length < 20) {
      await ctx.reply("Invalid address, please check and try again.");
      return;
    }

    const success = await addUserWallet(userId, address, nickname);

    if (success) {
      await ctx.reply(`Wallet ${nickname} added successfully!`);
      await addUserAction(userId, "");
    } else {
      await ctx.reply(
        "Could not add wallet. Try again later. Postgres may be slow or developer is sleeping."
      );
    }
  } catch (err) {
    console.error("Error in processWalletCreation:", err);
    await ctx.reply("Something went wrong. Not your fault, developer’s issue.");
  }
}

export async function handleBalances(ctx: Context) {
  try {
    await ctx.reply("Fetching balances for your wallets...");
    const balances = await getUserBalances(ctx.from!.id);
    let totalBalance = 0;
    let totalDiff = 0;
    let message = `
<b>Wallet Balances</b>\n
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
  } catch (err) {
    console.error("Error in handleBalances:", err);
    await ctx.reply(
      "Balance fetch failed. Not your fault. Developer’s headache."
    );
  }
}

export async function getTokens(ctx: Context, walletAddress: string) {
  try {
    await ctx.reply("Fetching token balances...");
    await getTokensInfo(ctx, walletAddress);
  } catch (err) {
    console.error("Error in getTokens:", err);
    await ctx.reply(
      "Could not get token balances. Developer will check later."
    );
  }
}

export async function handleTokenBalance(ctx: Context) {
  try {
    await ctx.reply("Send the token address to get balances.");
    await addUserAction(ctx.from!.id, "token_balance");
  } catch (err) {
    console.error("Error in handleTokenBalance:", err);
    await ctx.reply("Something broke. Not your fault, developer’s fix needed.");
  }
}

export async function tokenBalance(ctx: Context, tokenAddress: string) {
  try {
    await ctx.reply("Getting token balances from your wallets...");
    await getTokenBalances(ctx, tokenAddress, ctx.from!.id);
  } catch (err) {
    console.error("Error in tokenBalance:", err);
    await ctx.reply("Could not fetch token balance. Developer’s fault again.");
  }
}
