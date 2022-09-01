// @ts-check
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

/* eslint-disable @typescript-eslint/no-var-requires */
// You need to `tsc` before running this script.

import "dotenv/config";
import { REST } from "@discordjs/rest";
import { Routes } from "discord.js";
import CommandImportService from "../dist/services/CommandImportService.js";

const { DISCORD_API_TOKEN, CLIENT_ID } = process.env;
const isUndeploy = process.argv.some(x => x === "--undeploy");

if (!DISCORD_API_TOKEN || !CLIENT_ID) {
	console.log("Aborting command deployment");
	console.log("DISCORD_API_TOKEN or CLIENT_ID missing from the .env file.\n");
	process.exit(1);
}

const route = Routes.applicationCommands(CLIENT_ID);
const rest = new REST({ version: "10" }).setToken(DISCORD_API_TOKEN);
(async () => {
	const builders = await getSlashCommandBuilders();

	// TODO: Improve output of this command
	try {
		console.log(`Started deploying ${builders.length} application commands.`);
		await rest.put(route, { body: builders });
		console.log("Successfully deployed application commands.\n");
	} catch (error) {
		console.error(error);
	}
})();

async function getSlashCommandBuilders() {
	if (isUndeploy) {
		console.log("Undeploying guild commands");
		return [];
	}

	const commandImporter = new CommandImportService("./commands");
	const importedCommands = await commandImporter.load(true);

	const allSlashCommandBuilders = [];
	for (const { Class } of importedCommands) {
		const command = new Class("", null);
		allSlashCommandBuilders.push(command.builderJson);
	}

	return allSlashCommandBuilders;
}
