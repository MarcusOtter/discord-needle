import { importJsFilesInDirectory } from "../helpers/fileHelpers";
import { resolve as pathResolve } from "path";
import NeedleCommand from "../models/NeedleCommand";

export default class CommandLoader {
	private static directoryPath = pathResolve(__dirname, "../commands");
	private static commandCache: NeedleCommand[] = [];

	public static async loadCommands(skipCache = false): Promise<NeedleCommand[]> {
		if (!skipCache && this.commandCache.length > 0) return this.commandCache;

		console.log("Registered commands");
		this.commandCache = await importJsFilesInDirectory<NeedleCommand>(this.directoryPath);
		return this.commandCache;
	}

	public static getCommand(commandName: string): NeedleCommand | undefined {
		return this.commandCache.find(x => x.getName() === commandName);
	}
}
