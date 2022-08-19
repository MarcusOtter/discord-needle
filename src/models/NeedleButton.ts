import type { ButtonBuilder } from "discord.js";
import type NeedleBot from "../NeedleBot";
import type InteractionContext from "./InteractionContext";

export default abstract class NeedleButton {
	public abstract readonly customId: string;
	protected readonly bot: NeedleBot;

	constructor(bot: NeedleBot) {
		this.bot = bot;
	}

	public abstract getBuilder(text: string): ButtonBuilder;
	public abstract press(context: InteractionContext): Promise<void>;
}
