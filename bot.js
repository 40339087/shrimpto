// imports
const Discord = require("discord.js")

const Config = require("./config.json");
const NotionWrapper = require("./notion_wrapper")

// inits
const discordClient = new Discord.Client({intents: [
    Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.GUILD_MEMBERS,
    Discord.Intents.FLAGS.GUILD_MESSAGES,
    Discord.Intents.FLAGS.DIRECT_MESSAGES,
]});

discordClient.once("ready", async() => {
    console.log(
        "ShrimptoBot online..."
    )
})

// TODO: Move these commands into a different file.
discordClient.on("interactionCreate", async(interaction) => {
    if (!interaction.isCommand()) return;

    await interaction.deferReply();

    switch (interaction.commandName) {
        case "create_wallet": {
            const memberWallet = await NotionWrapper.getUserWallet(interaction.member.id);
            if (memberWallet === false) {
                await NotionWrapper.createWallet(interaction.member.id)
                interaction.editReply("Created a wallet for you! You have 🦐200.")
            } else {
                console.log("We've already seen this user!");
                interaction.editReply("Cannot create a wallet for you, you already have one!")
            }
            break;
        }
        case "get_wallet": {
            const memberWallet = await NotionWrapper.getUserWallet(interaction.member.id)

            if (memberWallet === false) {
                interaction.editReply("You don't have a wallet! Create one with /create_wallet")
            } else {
                interaction.editReply(
                    {
                        embeds: [
                            new Discord.MessageEmbed()
                            .setTitle(`${interaction.member.user.username}'s Wallet`)
                            .setAuthor("ShrimptoBot", "https://www.pngitem.com/pimgs/m/110-1101897_shrimp-png-transparent-png.png")
                            .addField("Balance", `${memberWallet.properties.balance.number}`, true)
                            .addField("Created At", `${new Date(memberWallet.properties.generatedAt.date.start).toUTCString()}`, true)
                        ]
                    }
                )
            }
            break;
        }
        case "send_shrimpto": {
            const senderWallet = await NotionWrapper.getUserWallet(interaction.member.id)

            if (!senderWallet) {
                interaction.editReply("You don't have a wallet! Create one with /create_wallet")
                return
            }

            const recipientWallet = await NotionWrapper.getUserWallet(interaction.options.getUser("recipient").id)

            if (!recipientWallet) {
                interaction.editReply("They don't have a wallet! Ask them to create one with /create_wallet")
                return
            }

            const transactionValid = await NotionWrapper.validateTransaction(
                interaction.member.id,
                interaction.options.getUser("recipient").id,
                interaction.options.getNumber("amount")
            )

            if (!transactionValid) {
                interaction.editReply("You don't have enough Shrimpto for this transaction...");
                return
            }

            await NotionWrapper.executeTransaction(
                interaction.member.id,
                interaction.options.getUser("recipient").id,
                interaction.options.getNumber("amount")
            )
            interaction.editReply("Transaction Complete.")
            break;
        }
        case "request_shrimpto": {
            console.log("Requesting Shrimpto from another user.")
            break;
        }
    }
})

discordClient.login(Config.SHRIMPTO_BOT_TOKEN)