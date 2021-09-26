/* eslint-disable @typescript-eslint/no-var-requires */
// IMPORTANT: You need to `tsc` before running this script.

// TODO: Make this a separate script when commands are more stable (don't try to run it on npm start)

const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");

const { getOrLoadAllCommands } = require("../dist/handlers/commandHandler");
const { getConfig, getApiToken } = require("../dist/helpers/configHelpers");

const API_TOKEN = getApiToken();

const CONFIG = getConfig();
if (CONFIG?.dev?.clientId ?? "" === "") { return; }
if (CONFIG?.dev?.guildId ?? "" === "") { return; }

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
			Routes.applicationGuildCommands(CONFIG.dev.clientId, CONFIG.dev.guildId),
			{ body: allSlashCommandBuilders },
		);
		console.log("Successfully deployed application commands.");
	}
	catch (error) {
		console.error(error);
	}
})();

