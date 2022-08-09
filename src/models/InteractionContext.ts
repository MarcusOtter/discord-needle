import type { ChatInputCommandInteraction, MessageComponentInteraction, ModalSubmitInteraction } from "discord.js";
import type NeedleBot from "../NeedleBot";

export default class InteractionContext {
	public readonly bot: NeedleBot;
	public readonly interaction: NeedleInteraction;
	// TODO: Message context?

	constructor(bot: NeedleBot, interaction: NeedleInteraction) {
		this.bot = bot;
		this.interaction = interaction;
	}
}

type NeedleInteraction = ChatInputCommandInteraction | MessageComponentInteraction | ModalSubmitInteraction;
