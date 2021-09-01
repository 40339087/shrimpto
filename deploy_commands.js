const { SlashCommandBuilder, SlashCommandMentionableOption } = require("@discordjs/builders")
const { REST } = require("@discordjs/rest")
const { Routes } = require("discord-api-types/v9")
const Config = require("./config.json")

const commands = [
    new SlashCommandBuilder().setName("create_wallet").setDescription("Create a new Shrimpto Wallet"),
    new SlashCommandBuilder().setName("get_wallet").setDescription("Get your Shrimtpo Wallet"),
    new SlashCommandBuilder().setName("send_shrimpto").setDescription("Send Shrimpto to someone else.")
    .addUserOption(
        option => option.setName("recipient").setDescription("The user to send your Shrimpto to.").setRequired(true)
    )
    .addNumberOption(
        option => option.setName("amount").setDescription("Amount of Shrimpto to send.").setRequired(true)
    ),
    new SlashCommandBuilder().setName("request_shrimpto").setDescription("Request Shrimpto from someone else.")
    .addUserOption(
        option => option.setName("debter").setDescription("The user to request Shrimtpo from.").setRequired(true)
    )
    .addNumberOption(
        option => option.setName("amount").setDescription("Amount of Shrimtpo to request.").setRequired(true)
    )
].map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(Config.SHRIMPTO_BOT_TOKEN);

(async() => {
    try {
        await rest.put(
            Routes.applicationGuildCommands(Config.SHRIMPTO_APPLICATION_ID, Config.SHRIMPTO_SERVER_ID),
            {
                body: commands
            }
        )

        console.log("Slash commands registered.")
    } catch (err) {
        console.log(err)
    }
})();