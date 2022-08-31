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

import { type APIApplicationCommand, REST, Routes } from "discord.js";
import type { ImportedClass } from "../helpers/typeHelpers.js";
import type NeedleCommand from "../models/NeedleCommand.js";
import DynamicImportService from "./DynamicImportService.js";

export default class CommandImportService extends DynamicImportService<typeof NeedleCommand> {
	private idCache: { id: string; name: string }[] = [];

	public async load(skipCache = false): Promise<ImportedClass<typeof NeedleCommand>[]> {
		if (this.idCache.length === 0) {
			this.idCache = await this.fetchGlobalApplicationCommands();
		}
		return super.load(skipCache);
	}

	public getId(commandName: string): string {
		const id = this.idCache.find(cmd => cmd.name === commandName)?.id;
		if (!id) throw new Error("Command probably undeployed: " + commandName);
		return id;
	}

	private async fetchGlobalApplicationCommands(): Promise<{ id: string; name: string }[]> {
		if (!process.env.DISCORD_API_TOKEN || !process.env.CLIENT_ID) {
			throw new Error("Missing API key or Client ID");
		}

		const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_API_TOKEN);
		const result = (await rest.get(Routes.applicationCommands(process.env.CLIENT_ID))) as APIApplicationCommand[];

		return result.map(cmd => {
			return { id: cmd.id, name: cmd.name };
		});
	}
}
