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

const isGlobal = process.argv.some(x => x === "--global");
const isUndeploy = process.argv.some(x => x === "--undeploy");

if (!API_TOKEN || !CLIENT_ID) {
	console.log("Aborting command deployment");
	console.log("DISCORD_API_TOKEN or CLIENT_ID missing from the .env file.\n");
	return;
}

if (isUndeploy && !GUILD_ID) {
	console.log("Aborting undeployment of guild commands");
	console.log("GUILD_ID is missing from the .env file, assuming no guild commands need to be undeployed.\n");
	return;
}

if (!isGlobal && !GUILD_ID) {
	console.log("Aborting guild command deployment");
	console.log("GUILD_ID is missing from the .env file.");
	console.log("Hint: If you just want to start the bot without developing new commands, type \"npm start\" instead\n");
	return;
}

const route = isGlobal
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
	if (isUndeploy) {
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
