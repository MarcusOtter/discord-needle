import type { Client, ClientEvents } from "discord.js";
import type NeedleBot from "../NeedleBot";

export default abstract class NeedleEventListener<TEventName extends keyof ClientEvents> {
	protected bot: NeedleBot;
	protected client: Client;
	protected eventName: TEventName;

	constructor(bot: NeedleBot, eventName: TEventName) {
		this.bot = bot;
		this.client = bot.getClient();
		this.eventName = eventName;
	}

	public abstract getListenerType(): "on" | "once";
	public abstract handleEventEmitted(...args: ClientEvents[TEventName]): Promise<void>;

	public getEventName(): TEventName {
		return this.eventName;
	}
}
