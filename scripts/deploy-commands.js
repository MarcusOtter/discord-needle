/* eslint-disable @typescript-eslint/no-var-requires */
// IMPORTANT: You need to `tsc` before running this script.

const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");

const { getAllCommands } = require("../dist/helpers/commandsHelper");
const { getConfig } = require("../dist/helpers/configHelper");

const CONFIG = getConfig();
const rest = new REST({ version: "9" }).setToken(CONFIG.discordApiToken);

(async () => {
	const commands = (await getAllCommands()).map(command => command.info);

	try {
		console.log("Started refreshing application (/) commands.");
		await rest.put(
			Routes.applicationGuildCommands(CONFIG.dev.clientId, CONFIG.dev.guildId),
			{ body: commands },
		);
		console.log("Successfully reloaded application (/) commands.");
	}
	catch (error) {
		console.error(error);
	}
})();

