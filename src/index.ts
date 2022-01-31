import { Client, Intents } from "discord.js";
import { getOrLoadAllCommands } from "./handlers/commandHandler";
import { handleInteractionCreate } from "./handlers/interactionHandler";
import { handleMessageCreate } from "./handlers/messageHandler";
import { deleteConfigsFromUnkownServers, getApiToken, resetConfigToDefault } from "./helpers/configHelpers";

(async () => {
	(await import("dotenv")).config();

	// Initial load of all commands
	await getOrLoadAllCommands(false);

	const CLIENT = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
	CLIENT.once("ready", () => {
		console.log("Ready!");
		deleteConfigsFromUnkownServers(CLIENT);
	});

	CLIENT.on("interactionCreate", interaction => handleInteractionCreate(interaction).catch(e => console.log(e)));
	CLIENT.on("messageCreate", message => handleMessageCreate(message).catch(e => console.log(e)));
	CLIENT.on("guildDelete", guild => { resetConfigToDefault(guild.id); });

	CLIENT.login(getApiToken() ?? undefined);
})();

