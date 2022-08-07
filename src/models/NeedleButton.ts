import type { ButtonBuilder } from "discord.js";
import type NeedleBot from "../NeedleBot";
import type InteractionContext from "./InteractionContext";

export default abstract class NeedleButton {
	public readonly customId: string;
	protected readonly bot: NeedleBot;

	constructor(customId: string, bot: NeedleBot) {
		this.customId = customId;
		this.bot = bot;
	}

	public abstract getBuilder(): Promise<ButtonBuilder>;
	public abstract onPressed(interaction: InteractionContext): Promise<void>;
}
