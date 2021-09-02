const Notion = require("@notionhq/client")
const { v4: uuidv4 } = require("uuid");
const Config = require("./config.json")

const notionClient = new Notion.Client({auth: Config.NOTION_CLIENT_TOKEN});

module.exports = {
    async createWallet(memberId, avatarUrl) {
        const walletCreation = await notionClient.pages.create({
            parent: {
                database_id: Config.WALLET_TABLE_ID
            },
            icon:{
                external: {
                    url: avatarUrl
                }
            },
            cover: {
                external: {
                    url: avatarUrl
                }
            },
            properties: {
                walletId: {
                    title: [
                        {
                            text: {
                                content: uuidv4()
                            }
                        }
                    ]
                },
                discordId: {
                    rich_text: [
                        {
                            text: {
                                content: memberId
                            }
                        }
                    ]
                },
                balance: {
                    number: 200
                },
                generatedAt: {
                    date: {
                        start: new Date().toISOString()
                    }
                }
            }
        })
    },
    async getUserWallet(memberId) {
        const walletQuery = await notionClient.databases.query({
            database_id: Config.WALLET_TABLE_ID,
            filter: {
                property: "discordId",
                text: {
                    contains: memberId
                }
            }
        })
        if (walletQuery.results.length === 1) {
            return walletQuery.results[0]
        }
        return false;
    },
    async validateTransaction(senderId, recipientId, amount) {
        const senderWallet = await this.getUserWallet(senderId);
        const recipientWallet = await this.getUserWallet(recipientId)
        
        return senderWallet.properties.balance.number >= amount
    },
    async executeTransaction(senderId, recipientId, amount) {
        const senderWallet = await this.getUserWallet(senderId);
        const recipientWallet = await this.getUserWallet(recipientId);

        await notionClient.pages.update({
            page_id: senderWallet.id,
            properties: {
                balance: {
                    number: senderWallet.properties.balance.number - amount
                }
            }
        })

        await notionClient.pages.update({
            page_id: recipientWallet.id,
            properties: {
                balance: {
                    number: recipientWallet.properties.balance.number + amount
                }
            }
        })

        await this.logTransaction(senderWallet, recipientWallet, amount);
    },
    async logTransaction(senderWallet, recipientWallet, amount) {
        await notionClient.pages.create({
            parent: {
                database_id: Config.TRANSACTION_TABLE_ID
            },
            properties: {
                transactionId: {
                    title: [
                        {
                            text: {
                                content: uuidv4()
                            }
                        }
                    ]
                },
                senderWalletId: {
                    relation: [
                        {
                            id: senderWallet.id
                        }
                    ]
                },
                recipientWalletId: {
                    relation: [
                        {
                            id: recipientWallet.id
                        }
                    ]
                },
                amount: {
                    number: amount
                },
                transactedAt: {
                    date: {
                        start: new Date().toISOString()
                    }
                }
            }
        })
    },
    async increaseBalance(recipientId, amount) {
        const recipientWallet = await this.getUserWallet(recipientId);

        await notionClient.pages.update({
            page_id: recipientWallet.id,
            properties: {
                balance: {
                    number: recipientWallet.properties.balance.number + amount
                }
            }
        })
    }
}