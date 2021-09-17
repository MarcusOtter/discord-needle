/* eslint-disable @typescript-eslint/no-var-requires */
// IMPORTANT: You need to `tsc` before running this script.

// TODO: Probably make this a separate script (don't try to run it on start)

const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");

const { getAllCommands } = require("../dist/handlers/commandHandler");
const { getConfig } = require("../dist/helpers/configHelpers");

const CONFIG = getConfig();
if (!CONFIG) { return; }
if (!CONFIG.dev) { return; }
if (!CONFIG.dev.clientId || CONFIG.dev.clientId === "") { return; }
if (!CONFIG.dev.guildId || CONFIG.dev.guildId === "") { return; }

const rest = new REST({ version: "9" }).setToken(CONFIG.discordApiToken);

(async () => {
	const commands = (await getAllCommands()).map(command => command.info);

	try {
		console.log(`Started refreshing ${commands.length} application commands.`);
		await rest.put(
			Routes.applicationGuildCommands(CONFIG.dev.clientId, CONFIG.dev.guildId),
			{ body: commands },
		);
		console.log("Successfully reloaded application commands.");
	}
	catch (error) {
		console.error(error);
	}
})();

