import type { CacheType, ChatInputCommandInteraction, Interaction, TextBasedChannel } from "discord.js";

export class InteractionValidator {
	private constructor() {
		// Not allowed
	}

	public static isValidChatInputCommand(interaction: Interaction): interaction is ValidChatInputCommandInteraction {
		return interaction.isChatInputCommand() && !!interaction.channel;
	}
}

export interface ValidChatInputCommandInteraction extends ChatInputCommandInteraction<CacheType> {
	channel: TextBasedChannel;
}
