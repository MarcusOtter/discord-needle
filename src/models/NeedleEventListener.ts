import type { ClientEvents } from "discord.js";
import type NeedleBot from "../NeedleBot";
import ListenerRunType from "./enums/ListenerRunType";

export default abstract class NeedleEventListener {
	public abstract readonly name: keyof ClientEvents;
	public abstract readonly runType: ListenerRunType;
	protected readonly bot: NeedleBot;

	constructor(bot: NeedleBot) {
		this.bot = bot;
	}

	public abstract handle(args: ClientEvents[keyof ClientEvents]): Promise<void>;
}
