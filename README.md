# Yokai

Yokai is a Telegram bot designed to help users manage multiple Solana wallets efficiently. Many users struggle to track their wallets, tokens, NFTs, and token prices across multiple accounts. **Yokai** solves this problem by centralizing wallet management and providing real-time updates on token prices and NFT holdings.

Check out the working bot here: [Yokai Telegram Bot](http://t.me/yokaiwallet_bot)

---

## Problem

- Users often have multiple Solana wallets.
- Tracking balances, tokens, NFTs, and price fluctuations across wallets is cumbersome.
- Manual tracking is time-consuming and prone to errors.

## Solution

**Yokai** provides a Telegram bot that allows users to:

- Add, view, and delete wallets.
- Check wallet balances.
- View all tokens in a wallet.
- Track token balances across all wallets.
- Fetch NFTs owned by wallets.
- Subscribe to tokens and receive real-time price updates.

---

## Features

- **Add Wallet** – Register a new wallet to track.
- **My Wallets** – List all added wallets.
- **Delete Wallet** – Remove a wallet from tracking.
- **Check Balances** – View wallet balances in real-time.
- **All Tokens of Wallet** – Fetch all tokens for a given wallet address.
- **Token Balances Across Wallets** – Track a token across multiple wallets.
- **NFTs** – View NFTs owned by tracked wallets.
- **Track Token Prices** – Subscribe to tokens and get real-time updates.

---

## Workflow

1. User registers on the bot.
2. Adds one or more wallets for tracking.
3. Fetches tokens from the added wallets.
4. Tracks token balances across all wallets.
5. Subscribes to NFTs and token price updates.
6. Receives real-time notifications about subscribed tokens.

---

## Technology Stack

- **Node.js** – Backend runtime  
- **TypeScript** – Type safety  
- **Prisma** – Database ORM  
- **Telegraf** – Telegram bot framework  
- **@solana/web3.js** – Solana SDK for blockchain interaction  
- **Cron Jobs** – Schedule periodic tasks for real-time token and NFT updates  

---

## Database Models

### User
```
model User {
  id        Int      @id @default(autoincrement())
  telegramId String  @unique
  username   String  @unique
  action     String?
  wallets    Wallet[]
}
```

### Wallet
```
model Wallet {
  id         Int    @id @default(autoincrement())
  address    String
  prevBalance String @default("0")
  nickname   String
  telegramId String
  user       User   @relation(fields: [telegramId], references: [telegramId])
}
```

### Tracked Token

```
model TrackedToken {
  id                     String   @id @default(cuid())
  userId                 String
  tokenSymbol            String
  tokenName              String
  lastNotifiedPercentage Int      @default(0)
  tokenId                String
  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt

  @@unique([userId, tokenId])
  @@index([userId])
}
```
---

## Why Yokai Matters

Managing multiple Solana wallets, tokens, and NFTs can be overwhelming. Users often miss important updates, token price changes, or NFT activity because there’s no single platform to monitor everything. **Yokai solves this problem by:**  

- **Centralizing Wallet Management:** Track all wallets in one place without switching apps.  
- **Real-Time Notifications:** Stay updated on token price changes and NFT activity instantly.  
- **Reducing Complexity:** Makes crypto management simple, even for users with multiple wallets.  
- **Empowering Users:** Enables informed decisions by providing clear visibility into holdings.  

**In short:** Yokai transforms the way Solana users interact with their assets — from scattered and confusing to simple, efficient, and proactive.  

Our vision is to become the go-to tool for crypto asset management, expanding support to multi-chain wallets and advanced analytics in the future.

