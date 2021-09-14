import { SlashCommandBuilder } from "@discordjs/builders";
import { BaseCommandInteraction } from "discord.js";

export interface NeedleCommand {
	info: SlashCommandBuilder;
	execute(interaction: BaseCommandInteraction): Promise<void>;
}
