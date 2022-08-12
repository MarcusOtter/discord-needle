import { ModalBuilder } from "discord.js";
import NeedleBot from "../NeedleBot";
import InteractionContext from "./InteractionContext";

export default abstract class NeedleModal {
	public abstract readonly customId: string;

	protected readonly bot: NeedleBot;

	constructor(bot: NeedleBot) {
		this.bot = bot;
	}

	// TODO: Stop making these async for no reason, maybe make it an abstract get
	public abstract getBuilder(): Promise<ModalBuilder>;
	public abstract submit(context: InteractionContext): Promise<void>;
}
