import { SlashCommandBuilder } from "@discordjs/builders";
import { BaseCommandInteraction } from "discord.js";
import { NeedleCommand } from "../helpers/commandsHelper";

export const command: NeedleCommand = {
	info: new SlashCommandBuilder()
		.setName("hello")
		.setDescription("Greets you"),

	async execute(interaction: BaseCommandInteraction): Promise<void> {
		await interaction.reply("Hello! :)");
	},
};

