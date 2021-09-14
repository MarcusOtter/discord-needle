import { Interaction } from "discord.js";
import { handleCommandInteraction } from "./commandHandler";

export function handleInteractionCreate(interaction: Interaction): void {
	if (!interaction.isCommand()) return;
	handleCommandInteraction(interaction);
}
