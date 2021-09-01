const Notion = require("@notionhq/client")
const Config = require("./config.json")

const notionClient = new Notion.Client({auth: Config.NOTION_CLIENT_TOKEN});

module.exports = {
    async createWallet(interaction) {
        const walletCreation = await notionClient.pages.create({
            parent: {
                database_id: Config.WALLET_TABLE_ID
            },
            properties: {
                discordId: {
                    title: [
                        {
                            text: {
                                content: interaction.member.id
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
    async checkUserHasWallet(discordId) {
        const walletQuery = await notionClient.databases.query({
            database_id: Config.WALLET_TABLE_ID,
            filter: {
                property: "discordId",
                text: {
                    contains: discordId
                }
            }
        })
        return walletQuery.results.length === 1
    },
    async getUserWallet(discordId) {
        const walletQuery = await notionClient.databases.query({
            database_id: Config.WALLET_TABLE_ID,
            filter: {
                property: "discordId",
                text: {
                    contains: discordId
                }
            }
        })
        return walletQuery.results[0]
    },
    async validateTransaction(senderWallet, amount) {
        const senderBalance = senderWallet.properties.balance.number
        return senderBalance >= amount
    },
    async executeTransaction(senderId, recipientId, amount) {
        const senderWallet = await this.getUserWallet(senderId);
        const recipientWallet = await this.getUserWallet(recipientId);

        await notionClient.pages.update(
            {
                page_id: senderWallet.id,
                properties: {
                    balance: {
                        number: senderWallet.properties.balance.number - amount
                    }
                }
            }
        )

        await notionClient.pages.update(
            {
                page_id: recipientWallet.id,
                properties: {
                    balance: {
                        number: recipientWallet.properties.balance.number + amount
                    }
                }
            }
        )
    }
}