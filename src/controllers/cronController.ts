import { fetchTokenPrices } from "../lib/jupiter";
import { Telegraf } from "telegraf";
import {
    getDistinctTrackedTokens,
    getUsersTrackingToken,
    updateNotificationThreshold,
    getTokensWithNotifications,
    resetTokenThresholds,
} from "../dbActions/trackToken";
import type { PriceAlertData } from "../types";

const ALERT_THRESHOLDS = [5, 10, 15, 20, 25, 30, 40, 50];

export async function checkPriceChanges(bot : Telegraf) : Promise<void>{
    try{
        console.log("Starting price check...");
        const trackedTokens = await getDistinctTrackedTokens();
        
        if(trackedTokens.length === 0){
            console.log("No tokens being tracked currently.");
            return;
        }

        const tokenIds = trackedTokens.map((t)=> t.tokenId);
        const priceData = await fetchTokenPrices(tokenIds);

        if(priceData.size === 0){
            console.log("No significant price changes detected.");
            return;
        }
        for(const token of trackedTokens){
            const data = priceData.get(token.tokenId);
            if(!data) continue;

            const triggerThreshold = ALERT_THRESHOLDS.slice().reverse().find((threshold)=>Math.abs(data.change24h) >= threshold);

            if(triggerThreshold){
                await sendPriceAlert(bot, {
                    tokenSymbol: token.tokenSymbol,
                    tokenName: token.tokenName,
                    tokenId : token.tokenId,
                    price: data.price,
                    change24h: data.change24h,
                    threshold: triggerThreshold,  
                })
            }
        }
        console.log("Price check completed.");
    } catch(err){
        console.error("Error in checkPriceChanges:", err);
    }
}

async function sendPriceAlert(bot : Telegraf, data: PriceAlertData): Promise<void>{
    try{
        const trackingUsers = await getUsersTrackingToken(data.tokenId);

        for(const user of trackingUsers){
            const signedThreshold = data.change24h >= 0 ? data.threshold : -data.threshold;
            
            const shouldNotify = data.change24h >= 0 
                ? signedThreshold > user.lastNotifiedPercentage
                : signedThreshold < user.lastNotifiedPercentage;
                
            if(!shouldNotify) continue;
            
            const direction = data.change24h >= 0 ? "increased" : "decreased";
            const emoji = data.change24h >= 0 ? "📈" : "📉";
            const message = `${emoji} *Price Alert*: ${data.tokenName} has ${direction} by *${Math.abs(data.change24h).toFixed(2)}%* in the last 24 hours.\nCurrent price: *$${data.price.toFixed(4)}*`;
            
            try{
                await bot.telegram.sendMessage(user.userId, message, {
                    parse_mode: "Markdown"
                });
                await updateNotificationThreshold(user.id, signedThreshold);

            }
            catch(err){
                console.error(`Failed to send message to user ${user.userId}:`, err);
            }
        }

    } catch(err){
        console.error("Error in sendPriceAlert:", err);
    }
}

export async function resetNotificationThresholds() : Promise<void>{
    try {
        console.log("Checking for tokens to reset...");
        const trackedTokens = await getTokensWithNotifications();
        
        if(trackedTokens.length === 0){
            console.log("No tokens need resetting.");
            return;
        }
        const tokenIds = trackedTokens.map((t)=> t.tokenId);
        const priceData = await fetchTokenPrices(tokenIds);

        for(const token of trackedTokens){
            const data = priceData.get(token.tokenId);
            const minThreshold = ALERT_THRESHOLDS[0];
            if(!data || (minThreshold && Math.abs(data.change24h) < minThreshold)) {
                await resetTokenThresholds(token.tokenId);
                console.log(`Reset thresholds for ${token.tokenSymbol} - no significant changes.`);
            }
        }
    }
    catch(err){
        console.error("Error in resetNotificationThresholds:", err);
    }
}