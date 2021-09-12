import { SlashCommandBuilder } from "@discordjs/builders";
import { BaseCommandInteraction } from "discord.js";
import { NeedleCommand } from "../helpers/commandsHelper";

export const command: NeedleCommand = {
	info: new SlashCommandBuilder()
		.setName("ping")
		.setDescription("Replies with pong"),

	async execute(interaction: BaseCommandInteraction): Promise<void> {
		await interaction.reply("Pong! :)");
	},
};

