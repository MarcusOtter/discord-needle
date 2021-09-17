import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { ephemeralReply, getThreadStartMessage } from "../helpers/messageHelpers";
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

	async execute(interaction: CommandInteraction): Promise<void> {
		const channel = interaction.channel;
		if (!channel?.isThread()) {
			return ephemeralReply(interaction, "You can only use this command inside a thread.");
		}

		const parentMessage = await getThreadStartMessage(channel);
		if (!parentMessage) {
			return ephemeralReply(interaction, "An unexpected error occurred.");
		}

		// TODO: Allow users with sufficient permissions to invoke this command as well
		if (parentMessage.author !== interaction.user) {
			return ephemeralReply(interaction, "You need to be the thread owner to change the title.");
		}

		const newThreadName = interaction.options.getString("value");
		if (!newThreadName) {
			return ephemeralReply(interaction, "You need to provide a new thread name when writing the command");
		}

		// Current rate limit is 2 renames per thread per 10 minutes (2021-09-17).
		// If that rate limit is hit, it will wait here until it is able to rename the thread.
		await channel.setName(newThreadName);
		await ephemeralReply(interaction, "Successfully changed title.");
	},
};
