import type { RESTPostAPIApplicationCommandsJSONBody } from "discord.js";
import type NeedleBot from "../NeedleBot";
import type InteractionContext from "./InteractionContext";

export default abstract class NeedleCommand {
	public readonly name: string;
	protected readonly bot: NeedleBot;

	constructor(name: string, bot: NeedleBot) {
		this.name = name;
		this.bot = bot;
	}

	public abstract getBuilder(): Promise<RESTPostAPIApplicationCommandsJSONBody>;
	public abstract execute(context: InteractionContext): Promise<void>;
}
