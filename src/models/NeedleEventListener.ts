import type { ClientEvents } from "discord.js";
import type NeedleBot from "../NeedleBot";
import ListenerRunType from "./enums/ListenerRunType";

export default abstract class NeedleEventListener {
	public readonly name: keyof ClientEvents;
	protected readonly bot: NeedleBot;

	constructor(name: keyof ClientEvents, bot: NeedleBot) {
		this.name = name;
		this.bot = bot;
	}

	public abstract getRunType(): ListenerRunType;
	public abstract onEmitted(...[...args]: ClientEvents[keyof ClientEvents]): Promise<void>;
}
