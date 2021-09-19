import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

export interface NeedleCommand {
	name: string;
	shortHelpDescription: string;
	longHelpDescription?: string;
	getSlashCommandBuilder(): Promise<ReturnType<SlashCommandBuilder["toJSON"]>>;
	execute(interaction: CommandInteraction): Promise<void>;
}
