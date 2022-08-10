"use strict";
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

require("dotenv").config();
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord.js");
const DynamicImportService = require("../dist/services/DynamicImportService").default;

const API_TOKEN = process.env.DISCORD_API_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const isGlobal = process.argv.some(x => x === "--global");
const isUndeploy = process.argv.some(x => x === "--undeploy");

if (!API_TOKEN || !CLIENT_ID) {
	console.log("Aborting command deployment");
	console.log("DISCORD_API_TOKEN or CLIENT_ID missing from the .env file.\n");
	process.exit(1);
}

if (isUndeploy && !GUILD_ID) {
	console.log("Aborting undeployment of guild commands");
	console.log("GUILD_ID is missing from the .env file, assuming no guild commands need to be undeployed.\n");
	process.exit(1);
}

if (!isGlobal && !GUILD_ID) {
	console.log("Aborting guild command deployment");
	console.log("GUILD_ID is missing from the .env file.");
	console.log('Hint: If you just want to start the bot without developing new commands, type "npm start" instead\n');
	process.exit(1);
}

const route = isGlobal ? Routes.applicationCommands(CLIENT_ID) : Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID);

const rest = new REST({ version: "9" }).setToken(API_TOKEN);
(async () => {
	const builders = await getSlashCommandBuilders();

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

	const commandImporter = new DynamicImportService("./commands");
	const importedCommands = await commandImporter.load(true);

	const allSlashCommandBuilders = [];
	for (const { fileName, Class } of importedCommands) {
		const command = new Class(fileName, null);
		const builder = await command.getBuilder();
		allSlashCommandBuilders.push(builder);
	}

	return allSlashCommandBuilders;
}
