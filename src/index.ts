import { Client, Intents } from "discord.js";
import { getOrLoadAllCommands } from "./handlers/commandHandler";
import { handleInteractionCreate } from "./handlers/interactionHandler";
import { handleMessageCreate } from "./handlers/messageHandler";
import { getConfig } from "./helpers/configHelpers";

const CLIENT = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

CLIENT.once("ready", async () => {
	console.log("Ready!");

	// Initial load of all commands
	await getOrLoadAllCommands();
});

CLIENT.on("interactionCreate", interaction => handleInteractionCreate(interaction));
CLIENT.on("messageCreate", message => handleMessageCreate(message));

CLIENT.login(getConfig().discordApiToken);
