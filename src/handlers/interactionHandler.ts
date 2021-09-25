import { Interaction } from "discord.js";
import { handleButtonClickedInteraction, handleCommandInteraction } from "./commandHandler";

export function handleInteractionCreate(interaction: Interaction): void {
	if (interaction.isCommand()) {
		handleCommandInteraction(interaction);
	}
	else if (interaction.isButton()) {
		handleButtonClickedInteraction(interaction);
	}
}
