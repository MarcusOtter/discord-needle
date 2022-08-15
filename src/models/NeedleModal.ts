import { ModalBuilder } from "discord.js";
import NeedleBot from "../NeedleBot";
import InteractionContext from "./InteractionContext";

export default abstract class NeedleModal {
	public abstract readonly customId: string;
	public abstract readonly builder: ModalBuilder;

	protected readonly bot: NeedleBot;

	constructor(bot: NeedleBot) {
		this.bot = bot;
	}

	public abstract submit(context: InteractionContext): Promise<void>;
}
