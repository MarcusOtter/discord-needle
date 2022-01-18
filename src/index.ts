import { Client, Intents } from "discord.js";
import { getOrLoadAllCommands } from "./handlers/commandHandler";
import { handleInteractionCreate } from "./handlers/interactionHandler";
import { handleMessageCreate } from "./handlers/messageHandler";
import { getApiToken } from "./helpers/configHelpers";

(async () => {
	(await import("dotenv")).config();

	// Initial load of all commands
	await getOrLoadAllCommands(false);

	const CLIENT = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
	CLIENT.once("ready", async () => {
		CLIENT.user?.setActivity("/help", { type: "WATCHING" });
	});

	CLIENT.on("interactionCreate", interaction => handleInteractionCreate(interaction).catch(e => console.log(e)));
	CLIENT.on("messageCreate", message => handleMessageCreate(message).catch(e => console.log(e)));

	CLIENT.login(getApiToken());
})();

