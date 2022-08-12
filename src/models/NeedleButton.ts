import type { ButtonBuilder } from "discord.js";
import type NeedleBot from "../NeedleBot";
import type InteractionContext from "./InteractionContext";

export default abstract class NeedleButton {
	// TODO: remove customId from ctor, put it in the actual class as name like commands do it
	public readonly customId: string;
	protected readonly bot: NeedleBot;

	constructor(customId: string, bot: NeedleBot) {
		this.customId = customId;
		this.bot = bot;
	}

	public abstract getBuilder(): Promise<ButtonBuilder>;
	public abstract press(context: InteractionContext): Promise<void>;
}
