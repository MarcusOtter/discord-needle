import { importJsFilesInDirectory } from "../helpers/fileHelpers";
import { resolve as pathResolve } from "path";
import NeedleCommand from "../domain/models/NeedleCommand";
import ICommandLoader from "../domain/abstractions/ICommandLoader";

export default class CommandLoader implements ICommandLoader {
	private directoryPath: string;
	private commandCache: NeedleCommand[];

	public constructor(commandsDirectoryRelativePath: string) {
		this.directoryPath = pathResolve(__dirname, commandsDirectoryRelativePath);
		this.commandCache = [];
	}

	public async loadCommands(skipCache = false): Promise<NeedleCommand[]> {
		if (!skipCache && this.commandCache.length > 0) return this.commandCache;

		this.commandCache = await importJsFilesInDirectory<NeedleCommand>(this.directoryPath);
		return this.commandCache;
	}
}
