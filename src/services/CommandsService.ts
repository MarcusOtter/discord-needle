import { importClassesInDirectory } from "../helpers/fileHelpers";
import { resolve as pathResolve } from "path";
import type NeedleCommand from "../models/NeedleCommand";
import NeedleBot from "../NeedleBot";

export default class CommandsService {
	private directoryPath = pathResolve(__dirname, "../commands");
	private commandCache: NeedleCommand[] = [];

	public async loadCommands(skipCache = false, bot: NeedleBot): Promise<NeedleCommand[]> {
		if (!skipCache && this.commandCache.length > 0) return this.commandCache;

		const commands = await importClassesInDirectory<typeof NeedleCommand>(this.directoryPath);
		this.commandCache = commands.map(command => new command.Class(command.fileName, bot));
		return this.commandCache;
	}

	public async getCommand(commandName: string): Promise<NeedleCommand | undefined> {
		return this.commandCache.find(x => x.name === commandName);
	}
}
