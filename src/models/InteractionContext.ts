import type { ChatInputCommandInteraction, MessageComponentInteraction, ModalSubmitInteraction } from "discord.js";
import type NeedleBot from "../NeedleBot";
import NeedleConfig from "./NeedleConfig";

export default class InteractionContext {
	public readonly bot: NeedleBot;
	public readonly interaction: NeedleInteraction;
	public readonly messages: NeedleConfig["messages"];
	// TODO: Message context?

	constructor(bot: NeedleBot, interaction: NeedleInteraction) {
		this.bot = bot;
		this.interaction = interaction;

		// Actually, we could be cheeky and inject the message variables here, if we had the context!
		// Even more actually, maybe we can construct the context from here? But it would depend on interaction I think.
		this.messages = bot.configs.get(interaction.guildId ?? "").messages;
	}
}

type NeedleInteraction = ChatInputCommandInteraction | MessageComponentInteraction | ModalSubmitInteraction;
