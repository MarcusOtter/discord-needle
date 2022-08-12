import { ModalBuilder } from "discord.js";
import NeedleBot from "../NeedleBot";
import InteractionContext from "./InteractionContext";

export default abstract class NeedleModal {
	public abstract readonly customId: string;

	protected readonly bot: NeedleBot;

	constructor(bot: NeedleBot) {
		this.bot = bot;
	}

	public abstract getBuilder(): Promise<ModalBuilder>;
	public abstract submit(context: InteractionContext): Promise<void>;
}
