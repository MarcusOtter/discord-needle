import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { NeedleCommand } from "../types/needleCommand";

export const command: NeedleCommand = {
	name: "ping",
	shortHelpDescription: "Replies with pong",

	async getSlashCommandBuilder() {
		return new SlashCommandBuilder()
			.setName("ping")
			.setDescription("Replies with pong")
			.toJSON();
	},

	async execute(interaction: CommandInteraction): Promise<void> {
		await interaction.reply("Pong! :)");
	},
};
