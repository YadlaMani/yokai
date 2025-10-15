import { Context } from "telegraf";
import { storeNewUser } from "../dbActions/user";

export async function handleStart(ctx: Context) {
  try {
    console.log(ctx.from);

    const { username, newUser } = await storeNewUser(
      ctx.from!.id,
      ctx.from?.username
    );

    if (username === "unknown") {
      await ctx.reply(
        "Postgres is slow right now. Try again after 5 minutes or help us with some funds."
      );
      return;
    }

    if (newUser) {
      await ctx.reply(`Hey ${username}, welcome! Use the menu to explore.`);
    } else {
      await ctx.reply(`Welcome back ${username}, good to see you again.`);
    }
  } catch (err) {
    console.error("Error in handleStart:", err);
    await ctx.reply(
      "Something went wrong. Not your fault. The developer will check it later."
    );
  }
}
