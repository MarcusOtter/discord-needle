import type { ChatInputCommandInteraction, MessageComponentInteraction, ModalSubmitInteraction } from "discord.js";
import type NeedleBot from "../NeedleBot";

export default class InteractionContext {
	public readonly bot: NeedleBot;
	public readonly interaction: ChatInputCommandInteraction | MessageComponentInteraction | ModalSubmitInteraction;
	// TODO: Message context?

	constructor(
		bot: NeedleBot,
		interaction: ChatInputCommandInteraction | MessageComponentInteraction | ModalSubmitInteraction
	) {
		this.bot = bot;
		this.interaction = interaction;
	}
}
