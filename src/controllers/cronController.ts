import { prisma } from "../lib/db";
import { fetchTokenPrices } from "../lib/jupiter";
import { Telegraf } from "telegraf";

const ALERT_THRESHOLDS = [5, 10, 15, 20, 25, 30, 40, 50];

export async function checkPriceChanges(bot : Telegraf) : Promise<void>{
    try{
        console.log("Starting price check...");
        const trackedTokens = await prisma.trackedToken.findMany({
            distinct : ["tokenSymbol"],
            select : {
                tokenSymbol : true,
                tokenName : true,
                tokenId : true
            },
        });
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

            const triggerThreshold = ALERT_THRESHOLDS.slice().reverse().find((threshold)=>data.change24h >= threshold);

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

interface PriceAlertData {
    tokenSymbol: string;
    tokenName: string;
    tokenId: string;
    price: number;
    change24h: number;
    threshold: number;
}

async function sendPriceAlert(bot : Telegraf, data: PriceAlertData): Promise<void>{
    try{
        const trackingUsers = await prisma.trackedToken.findMany({
            where : {
                tokenId : data.tokenId
            },
            select : {
                id : true,
                userId : true,
                lastNotifiedPercentage : true
            }
        });

        for(const user of trackingUsers){
            const shouldNotify = data.threshold > user.lastNotifiedPercentage;
            if(!shouldNotify) continue;
            const message = `Price alert : ${data.tokenName} has changed by ${data.change24h.toFixed(2)}% in the last 24 hours. Current price is $${data.price.toFixed(4)}.`;
            try{
                await bot.telegram.sendMessage(user.userId, message, {
                    parse_mode: "Markdown"
                });
                await prisma.trackedToken.update({
                    where : {
                        id : user.id
                    },
                    data : {
                        lastNotifiedPercentage : data.threshold
                    },
                });

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
        const trackedTokens = await prisma.trackedToken.findMany({
            where : {
                lastNotifiedPercentage : {
                    gt : 0,
                },
            },
            distinct : ["tokenId"],
            select : {
                tokenId : true,
                tokenSymbol : true,
            },
        })
        if(trackedTokens.length === 0){
            console.log("No tokens need resetting.");
            return;
        }
        const tokenIds = trackedTokens.map((t)=> t.tokenId);
        const priceData = await fetchTokenPrices(tokenIds);

        for(const token of trackedTokens){
            const data = priceData.get(token.tokenId);
            if(!data) {
                await prisma.trackedToken.updateMany({
                    where : {
                        tokenId : token.tokenId
                    },
                    data : {
                        lastNotifiedPercentage : 0
                    }
                });

                console.log(`Reset thresholds for ${token.tokenSymbol} as it no longer has significant changes.`);
            }

        }
    }
    catch(err){
        console.error("Error in resetNotificationThresholds:", err);
    }
}