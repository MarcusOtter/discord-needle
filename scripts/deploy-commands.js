/* eslint-disable @typescript-eslint/no-var-requires */
// IMPORTANT: You need to `tsc` before running this script.

// TODO: Make this a separate script when commands are more stable (don't try to run it on npm start)

require("dotenv").config();

const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");

const { getOrLoadAllCommands } = require("../dist/handlers/commandHandler");
const { getApiToken, getGuildId, getClientId } = require("../dist/helpers/configHelpers");

const API_TOKEN = getApiToken();
const CLIENT_ID = getClientId();
const GUILD_ID = getGuildId();

if (!API_TOKEN || !CLIENT_ID || !GUILD_ID) {
	console.log("API_TOKEN, CLIENT_ID, or GUILD_ID was missing from the .env file: aborting command deployment");
	console.log("Hint: If you just want to start the bot without developing commands, type \"npm start\" instead\n");
	return;
}

const rest = new REST({ version: "9" }).setToken(API_TOKEN);
(async () => {
	const allNeedleCommands = await getOrLoadAllCommands();
	const allSlashCommandBuilders = [];
	for (const command of allNeedleCommands) {
		const builder = await command.getSlashCommandBuilder();
		allSlashCommandBuilders.push(builder);
	}

	try {
		console.log(`Started deploying ${allSlashCommandBuilders.length} application commands.`);
		await rest.put(
			Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
			{ body: allSlashCommandBuilders },
		);
		console.log("Successfully deployed application commands.");
	}
	catch (error) {
		console.error(error);
	}
})();

