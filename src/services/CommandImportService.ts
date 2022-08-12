import { APIApplicationCommand, REST, Routes } from "discord.js";
import { ImportedClass } from "../helpers/typeHelpers";
import NeedleCommand from "../models/NeedleCommand";
import DynamicImportService from "./DynamicImportService";

export default class CommandImportService extends DynamicImportService<typeof NeedleCommand> {
	private idCache: { id: string; name: string }[] = [];

	public async load(skipCache = false): Promise<ImportedClass<typeof NeedleCommand>[]> {
		if (this.idCache.length === 0) {
			this.idCache = await this.fetchGlobalApplicationCommands();
		}
		return super.load(skipCache);
	}

	public getId(commandName: string): string | undefined {
		return this.idCache.find(cmd => cmd.name === commandName)?.id;
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
