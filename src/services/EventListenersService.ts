import { importClassesInDirectory } from "../helpers/fileHelpers";
import { resolve as pathResolve } from "path";
import type NeedleEventListener from "../models/NeedleEventListener";
import type { ClientEvents } from "discord.js";
import type NeedleBot from "../NeedleBot";

export default class EventListenersService {
	private directoryPath = pathResolve(__dirname, "../eventListeners");
	private eventCache: NeedleEventListener[] = [];

	public async loadEventListeners(skipCache = false, bot: NeedleBot): Promise<NeedleEventListener[]> {
		if (!skipCache && this.eventCache.length > 0) return this.eventCache;

		const events = await importClassesInDirectory<typeof NeedleEventListener>(this.directoryPath);
		this.eventCache = events.map(event => new event.Class(event.fileName as keyof ClientEvents, bot));
		return this.eventCache;
	}
}
