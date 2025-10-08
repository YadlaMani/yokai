import { Context } from "telegraf";
import { storeNewUser } from "../dbActions/user";

export async function handleStart(ctx: Context) {
  console.log(ctx.from);
  const { username, newUser } = await storeNewUser(
    ctx.from!.id,
    ctx.from?.username
  );
  
  if (username === "unknown") {
    await ctx.reply(
      "We are using postgres to store data it might have faced cold start issue,please try after 5 min or funds us"
    );
    return;
  }
  
  if (newUser) {
    await ctx.reply(`Yo! welcome ${username} explore the bot using menu`);
  } else {
    await ctx.reply(`Welcome back ${username} we missed you!`);
  }
}