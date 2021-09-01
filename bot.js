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
        case "create_wallet":
            const canCreate = !await NotionWrapper.checkUserHasWallet(interaction.member.id);

            if (canCreate) {
                await NotionWrapper.createWallet(interaction)
                interaction.editReply("Created a wallet for you! You have 🦐200.")
            } else {
                console.log("We've already seen this user!");
                interaction.editReply("Cannot create a wallet for you, you already have one!")
            }
            break;
        case "get_wallet":
            const hasWallet = await NotionWrapper.checkUserHasWallet(interaction.member.id);
            
            if (hasWallet) {
                const userWallet = await NotionWrapper.getUserWallet(interaction.member.id);
                interaction.editReply(
                    {
                        embeds: [
                            new Discord.MessageEmbed()
                            .setTitle(`${interaction.member.user.username}'s Wallet`)
                            .setAuthor("ShrimptoBot", "https://www.pngitem.com/pimgs/m/110-1101897_shrimp-png-transparent-png.png")
                            .addField("Balance", `${userWallet.properties.balance.number}`, true)
                            .addField("Created At", `${new Date(userWallet.properties.generatedAt.date.start).toUTCString()}`, true)
                        ]
                    }
                )
            } else {
                interaction.editReply("You don't have a wallet! Create one with /create_wallet")
            }
            break;
        case "send_shrimpto":
            // check if the user has a wallet.
            const userHasWallet = await NotionWrapper.checkUserHasWallet(interaction.member.id);

            if (!userHasWallet) {
                interaction.editReply("You don't have a wallet! Create one with /create_wallet")
            }

            const targetHasWallet = await NotionWrapper.checkUserHasWallet(interaction.options.getUser("recipient").id)

            if (!targetHasWallet) {
                interaction.editReply(`${interaction.options.getUser("recipient").username} doesn't have a wallet.`)
            }

            const transactionValid = await NotionWrapper.validateTransaction(
                await NotionWrapper.getUserWallet(interaction.member.id), interaction.options.getNumber("amount")
            )

            if (transactionValid) {
                await NotionWrapper.executeTransaction(
                    interaction.member.id, interaction.options.getUser("recipient").id, interaction.options.getNumber("amount")
                )
                interaction.editReply("Shrimpto Sent!")

            } else {
                interaction.editReply("You don't have enough Shrimpto to send.")
            }
            break;
        case "request_shrimpto":
            console.log("Requesting Shrimpto from another user.")
            break;
    }
})

discordClient.login(Config.SHRIMPTO_BOT_TOKEN)