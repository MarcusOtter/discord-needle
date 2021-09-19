import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { NeedleCommand } from "../types/needleCommand";

export const command: NeedleCommand = {
	info: new SlashCommandBuilder()
		.setName("ping")
		.setDescription("Replies with pong"),

	async execute(interaction: CommandInteraction): Promise<void> {
		await interaction.reply("Pong! :)");
	},
};

