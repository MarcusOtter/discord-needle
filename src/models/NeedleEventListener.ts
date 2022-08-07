import type { Client, ClientEvents } from "discord.js";
import type NeedleBot from "../NeedleBot";

export default abstract class NeedleEventListener {
	protected bot: NeedleBot;
	protected client: Client;
	protected eventName: keyof ClientEvents;

	constructor(bot: NeedleBot, eventName: keyof ClientEvents) {
		this.bot = bot;
		this.client = bot.getClient();
		this.eventName = eventName;
	}

	public abstract getListenerType(): "on" | "once";
	public abstract handleEventEmitted(...args: ClientEvents[keyof ClientEvents]): Promise<void>;

	public getEventName(): keyof ClientEvents {
		return this.eventName;
	}
}
