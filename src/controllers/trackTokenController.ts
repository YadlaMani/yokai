import { Markup, type Context } from "telegraf";
import { tokenString, AVAILABLE_TOKENS } from "../constants/tokens";
import { tokens } from "../constants/tokens";
import { addUserAction } from "../dbActions/user";
import { prisma } from "../lib/db";

const userSelections = new Map<number, Set<string>>();

export async function handleTrackToken(ctx : Context){
    try{
        const userId = ctx.from?.id;
        if(!userId) return;
        userSelections.set(userId, new Set());

        const trackedTokens = await prisma.trackedToken.findMany({
            where : {userId : userId.toString()}
        });

        const currentlyTracked = trackedTokens.map((t: { tokenSymbol: any; })=> t.tokenSymbol);
        const message = "Select up to 5 tokens to track, Currently tracking : " + (currentlyTracked.length > 0 ? currentlyTracked.join(", ") : "None");

        const keyboard = Markup.inlineKeyboard([
            ...AVAILABLE_TOKENS.map((token)=>[
                Markup.button.callback(
                    `${currentlyTracked.includes(token.symbol) ? "✅" : ""} ${token.name}`,
                    `track_toggle_${token.symbol}`
                )
            ]),
            [Markup.button.callback("Save", "track_save"), Markup.button.callback("Cancel", "track_cancel")]
        ])
        await ctx.reply(message, {parse_mode: "Markdown", ...keyboard});
    } catch(err){
        console.error("Error in handleTrackToken:", err);
        await ctx.reply("Something went wrong. The developer will check it later.");
    }
}

export async function handleTrackToggle(ctx : Context){
    try{
        const userId = ctx.from?.id;
        if(!userId) return;

        await ctx.answerCbQuery();
        const callbackData = (ctx.callbackQuery as any).data;
        const tokenSymbol = callbackData.replace("track_toggle_", "");

        let selections = userSelections.get(userId) || new Set<string>();

        if(selections.has(tokenSymbol)){
            selections.delete(tokenSymbol);
        } else{
            if(selections.size >= 5){
                await ctx.reply("You can only select up to 5 tokens.");
                return;
            }
            selections.add(tokenSymbol);
        }
        userSelections.set(userId, selections);
        const selectedTokens = Array.from(selections).join(", ") || "None";
        const message = "Select up to 5 tokens to track, Currently selected : " + selectedTokens;
        
        const keyboard = Markup.inlineKeyboard([
            ...AVAILABLE_TOKENS.map((token)=>[
                Markup.button.callback(
                    `${selections.has(token.symbol) ? "✅" : ""} ${token.name}`,
                    `track_toggle_${token.symbol}`
                )
            ]),
            [Markup.button.callback("Save", "track_save"), Markup.button.callback("Cancel", "track_cancel")]
        ])
        await ctx.editMessageText(message, {parse_mode: "Markdown", ...keyboard});
    } catch(err){
        console.error("Error in handleTrackToggle:", err);
        await ctx.reply("Something went wrong. The developer will check it later.");
    }
}

export async function handleTrackSave(ctx : Context){
        const userId = ctx.from?.id;
        if(!userId) return;
        
        await ctx.answerCbQuery();
        const selections = userSelections.get(userId) || new Set<string>();

        if(selections.size === 0){
            await ctx.editMessageText("No tokens selected to track.");
            userSelections.delete(userId);
            return;
        }
        try{
            await prisma.trackedToken.deleteMany({
                where : {userId : userId.toString()}
            });
            const tokens = Array.from(selections).map((symbol)=>{
                const token = AVAILABLE_TOKENS.find((t)=> t.symbol === symbol);
                return {
                    userId : userId.toString(),
                    tokenSymbol : symbol,
                    tokenName : token?.name || symbol,
                    tokenId : token?.tokenId || symbol.toLowerCase(),
                }
            })

            await prisma.trackedToken.createMany({
                data : tokens
            })
            await ctx.editMessageText("Tracking saved for tokens: " + Array.from(selections).join(", "), {parse_mode: "Markdown"});
            userSelections.delete(userId);
        }
        catch(err){
            console.error("Database error in handleTrackSave:", err);
            await ctx.reply("Failed to save your selections. Please try again later.");
        }
   
}

export async function handleTrackCancel(ctx : Context){
    try{
        const userId = ctx.from?.id;
        if(!userId) return;
        
        await ctx.answerCbQuery();
        userSelections.delete(userId);
        await ctx.editMessageText("Token tracking selection cancelled.");
    } catch(err){
        console.error("Error in handleTrackCancel:", err);
        await ctx.reply("Something went wrong. The developer will check it later.");
    }
}