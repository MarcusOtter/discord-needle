import { Interaction } from "discord.js";
import { resetMessageContext, addMessageContext } from "../helpers/messageHelpers";
import { handleButtonClickedInteraction, handleCommandInteraction } from "./commandHandler";

export async function handleInteractionCreate(interaction: Interaction): Promise<void> {
	addMessageContext({
		invoker: interaction.user,
		interaction: interaction,
		sourceChannel: interaction.channel ?? undefined,
		guildId: interaction.guildId,
	});

	if (interaction.isCommand()) {
		await handleCommandInteraction(interaction);
	}
	else if (interaction.isButton()) {
		await handleButtonClickedInteraction(interaction);
	}

	resetMessageContext();
}
