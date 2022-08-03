import { importJsFilesInDirectory } from "../helpers/fileHelpers";
import { resolve as pathResolve } from "path";
import type NeedleEventListener from "../models/NeedleEventListener";
import type { ClientEvents } from "discord.js";
import NeedleBot from "../NeedleBot";

export default class EventListenersService {
	private directoryPath = pathResolve(__dirname, "../eventListeners");
	private eventCache: NeedleEventListener<keyof ClientEvents>[] = [];

	public async loadEventListeners(
		skipCache = false,
		bot: NeedleBot
	): Promise<NeedleEventListener<keyof ClientEvents>[]> {
		if (!skipCache && this.eventCache.length > 0) return this.eventCache;

		const events = await importJsFilesInDirectory<NeedleEventListener<keyof ClientEvents>>(this.directoryPath, bot);

		this.eventCache = Array.from(events.values());
		return this.eventCache;
	}
}
