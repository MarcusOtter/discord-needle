import { SlashCommandBuilder } from "@discordjs/builders";
import { BaseCommandInteraction, ThreadChannel } from "discord.js";
import { NeedleCommand } from "../types/needleCommand";

export const command: NeedleCommand = {
	info: new SlashCommandBuilder()
		.setName("title")
		.setDescription("Set the title of a thread")
		.addStringOption(option => {
			return option
				.setName("value")
				.setDescription("The new title of the thread")
				.setRequired(true);
		}),

	async execute(interaction: BaseCommandInteraction): Promise<void> {
		const channel = interaction.channel;

		if (!channel) { return; }

		if (!channel.isThread()) {
			return interaction.reply({ content: "You can only use this command from a thread.", ephemeral: true });
		}

		if (channel.parentId === null) { return; }
		const parentChannel = await interaction.guild?.channels.fetch(channel.parentId);
		if (!parentChannel?.isText()) { return; }

		const parentMessage = await parentChannel.messages.fetch(channel.id);

		if (parentMessage.author !== interaction.user) {
			return interaction.reply({ content: "You need to be the thread owner to change its title" });
		}

		await interaction.reply("Successfully attempted to change title ");
	},
};

