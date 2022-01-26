import { Client, Intents } from "discord.js";
import { resolve as pathResolve } from "path";
import { readdirSync } from "fs";
import { getOrLoadAllCommands } from "./handlers/commandHandler";
import { handleInteractionCreate } from "./handlers/interactionHandler";
import { handleMessageCreate } from "./handlers/messageHandler";
import { getApiToken, resetConfigToDefault } from "./helpers/configHelpers";

const CONFIGS_PATH = pathResolve(__dirname, "../configs");

(async () => {
	(await import("dotenv")).config();

	// Initial load of all commands
	await getOrLoadAllCommands(false);

	const CLIENT = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
	CLIENT.once("ready", () => {
		console.log("Ready!");

		if (!CLIENT.guilds.cache.size) {
			console.warn("No guilds available; skipping config deletion.");
			return;
		}

		const files = readdirSync(CONFIGS_PATH);
		files.forEach(file => {
			const id = file.split(".")[0];
			if (!CLIENT.guilds.cache.has(id)) {
				resetConfigToDefault(id);
				console.log(`Deleted config for guild ${id}`);
			}
		});
	});

	CLIENT.on("interactionCreate", interaction => handleInteractionCreate(interaction).catch(e => console.log(e)));
	CLIENT.on("messageCreate", message => handleMessageCreate(message).catch(e => console.log(e)));
	CLIENT.on("guildDelete", guild => {
		resetConfigToDefault(guild.id);
		console.log(`Deleted data for guild ${guild.id}`);
	});

	CLIENT.login(getApiToken() ?? undefined);
})();

