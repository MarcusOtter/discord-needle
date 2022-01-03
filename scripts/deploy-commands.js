/* eslint-disable @typescript-eslint/no-var-requires */
// IMPORTANT: You need to `tsc` before running this script.

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

const route = process.argv.some(x => x === "--global")
	? Routes.applicationCommands(CLIENT_ID)
	: Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID);

const rest = new REST({ version: "9" }).setToken(API_TOKEN);
(async () => {
	const builders = await getSlashCommandBuilders();

	try {
		console.log(`Started deploying ${builders.length} application commands.`);
		await rest.put(
			route,
			{ body: builders },
		);
		console.log("Successfully deployed application commands.\n");
	}
	catch (error) {
		console.error(error);
	}
})();

async function getSlashCommandBuilders() {
	if (process.argv.some(x => x === "--undeploy")) {
		console.log("Undeploying guild commands");
		return [];
	}

	const allNeedleCommands = await getOrLoadAllCommands();
	const allSlashCommandBuilders = [];
	for (const command of allNeedleCommands) {
		const builder = await command.getSlashCommandBuilder();
		allSlashCommandBuilders.push(builder);
	}

	return allSlashCommandBuilders;
}
