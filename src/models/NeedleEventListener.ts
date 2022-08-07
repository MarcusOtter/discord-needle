import type { Client, ClientEvents } from "discord.js";
import type NeedleBot from "../NeedleBot";
import ListenerRunType from "./enums/ListenerRunType";

export default abstract class NeedleEventListener {
	public readonly name: keyof ClientEvents;

	protected bot: NeedleBot;
	protected client: Client;

	constructor(name: keyof ClientEvents, bot: NeedleBot) {
		this.name = name;

		this.bot = bot;
		this.client = bot.getClient();
	}

	public abstract getListenerType(): ListenerRunType;
	public abstract handleEventEmitted(...[...args]: ClientEvents[keyof ClientEvents]): Promise<void>;
}
