/*
This file is part of Needle.

Needle is free software: you can redistribute it and/or modify it under the terms of the GNU
Affero General Public License as published by the Free Software Foundation, either version 3 of
the License, or (at your option) any later version.

Needle is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even
the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero
General Public License for more details.

You should have received a copy of the GNU Affero General Public License along with Needle.
If not, see <https://www.gnu.org/licenses/>.
*/

import { config } from "dotenv";
config();

import { Client, Intents } from "discord.js";
import { getOrLoadAllCommands } from "./handlers/commandHandler";
import { handleInteractionCreate } from "./handlers/interactionHandler";
import { handleMessageCreate } from "./handlers/messageHandler";
import { deleteConfigsFromUnknownServers, getApiToken, resetConfigToDefault } from "./helpers/configHelpers";

console.log(`Needle, a Discord bot that declutters your server by creating threads
Copyright (C) 2022  Marcus Otterström

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
`);

(async () => {
	// Initial load of all commands
	await getOrLoadAllCommands(false);

	const sweepSettings = {
		interval: 14400, // 4h
		lifetime: 3600, // 1h
	};

	const CLIENT = new Client({
		intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
		presence: {
			activities: [
				{
					type: "LISTENING",
					name: "/help",
				},
			],
		},
		sweepers: {
			messages: sweepSettings,
			threads: sweepSettings,
		},
	});

	CLIENT.once("ready", () => {
		console.log("Ready!");
		deleteConfigsFromUnknownServers(CLIENT);
	});

	CLIENT.on("interactionCreate", interaction => handleInteractionCreate(interaction).catch(console.error));
	CLIENT.on("messageCreate", message => handleMessageCreate(message).catch(console.error));
	CLIENT.on("guildDelete", guild => {
		resetConfigToDefault(guild.id);
	});

	CLIENT.login(getApiToken());

	process.on("SIGINT", () => {
		CLIENT.destroy();
		console.log("Destroyed client");
		process.exit(0);
	});
})();
