// ________________________________________________________________________________________________
//
// This file is part of Needle.
//
// Needle is free software: you can redistribute it and/or modify it under the terms of the GNU
// Affero General Public License as published by the Free Software Foundation, either version 3 of
// the License, or (at your option) any later version.
//
// Needle is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even
// the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero
// General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License along with Needle.
// If not, see <https://www.gnu.org/licenses/>.
//
// ________________________________________________________________________________________________

import { Client, Intents } from "discord.js";
import { ActivityTypes } from "discord.js/typings/enums";
import { getOrLoadAllCommands } from "./handlers/commandHandler";
import { handleInteractionCreate } from "./handlers/interactionHandler";
import { handleMessageCreate } from "./handlers/messageHandler";
import { deleteConfigsFromUnkownServers, getApiToken, resetConfigToDefault } from "./helpers/configHelpers";

console.log("Needle, a Discord bot that declutters your server by creating threads\nCopyright (C) 2022  Marcus Otterström\n\nThis program is free software: you can redistribute it and/or modify\nit under the terms of the GNU Affero General Public License as published\nby the Free Software Foundation, either version 3 of the License, or\n(at your option) any later version.\n\nThis program is distributed in the hope that it will be useful,\nbut WITHOUT ANY WARRANTY; without even the implied warranty of\nMERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the\nGNU Affero General Public License for more details.\n\nYou should have received a copy of the GNU Affero General Public License\nalong with this program.  If not, see <https://www.gnu.org/licenses/>.\n");

(async () => {
	(await import("dotenv")).config();

	// Initial load of all commands
	await getOrLoadAllCommands(false);

	const CLIENT = new Client({
		intents: [
			Intents.FLAGS.GUILDS,
			Intents.FLAGS.GUILD_MESSAGES,
		],
		presence: {
			activities: [{
				type: ActivityTypes.LISTENING,
				name: "/help",
			}],
		},
	});

	CLIENT.once("ready", () => {
		console.log("Ready!");
		deleteConfigsFromUnkownServers(CLIENT);
	});

	CLIENT.on("interactionCreate", interaction => handleInteractionCreate(interaction).catch(e => console.log(e)));
	CLIENT.on("messageCreate", message => handleMessageCreate(message).catch(e => console.log(e)));
	CLIENT.on("guildDelete", guild => { resetConfigToDefault(guild.id); });

	CLIENT.login(getApiToken());
})();

