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
const { Routes } = require("discord-api-types/v9");

const { getOrLoadAllCommands } = require("../dist/handlers/commandHandler");
const { getApiToken, getGuildId, getClientId } = require("../dist/helpers/configHelpers");

const API_TOKEN = getApiToken();
const CLIENT_ID = getClientId();
const GUILD_ID = getGuildId();

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

	const allNeedleCommands = await getOrLoadAllCommands();
	const allSlashCommandBuilders = [];
	for (const command of allNeedleCommands) {
		const builder = await command.getSlashCommandBuilder();
		allSlashCommandBuilders.push(builder);
	}

	return allSlashCommandBuilders;
}
