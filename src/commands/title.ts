import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember, Permissions } from "discord.js";
import { ephemeralReply, getThreadStartMessage } from "../helpers/messageHelpers";
import { NeedleCommand } from "../types/needleCommand";

export const command: NeedleCommand = {
	name: "title",
	shortHelpDescription: "Sets the title of a thread to `value`",

	async getSlashCommandBuilder() {
		return new SlashCommandBuilder()
			.setName("title")
			.setDescription("Sets the title of a thread")
			.addStringOption(option => {
				return option
					.setName("value")
					.setDescription("The new title of the thread")
					.setRequired(true);
			})
			.toJSON();
	},

	async execute(interaction: CommandInteraction): Promise<void> {
		const member = interaction.member;
		if (!(member instanceof GuildMember)) {
			return ephemeralReply(interaction, "An unexpected error occurred.");
		}

		const channel = interaction.channel;
		if (!channel?.isThread()) {
			return ephemeralReply(interaction, "You can only use this command inside a thread.");
		}

		const parentMessage = await getThreadStartMessage(channel);
		if (!parentMessage) {
			return ephemeralReply(interaction, "An unexpected error occurred.");
		}

		const hasChangeTitlePermissions = member.permissionsIn(channel).has(Permissions.FLAGS.MANAGE_THREADS, true);
		if (!hasChangeTitlePermissions && parentMessage.author !== interaction.user) {
			return ephemeralReply(interaction, "You need to be the thread owner to change the title.");
		}

		const newThreadName = interaction.options.getString("value");
		if (!newThreadName) {
			return ephemeralReply(interaction, "You need to provide a new thread name when writing the command");
		}

		const oldThreadName = channel.name;

		// Current rate limit is 2 renames per thread per 10 minutes (2021-09-17).
		// If that rate limit is hit, it will wait here until it is able to rename the thread.
		await channel.setName(newThreadName, `Changed by ${member.user.tag} (${member.id})`);
		await ephemeralReply(interaction, `Successfully changed title from \`${oldThreadName}\` to \`${newThreadName}\`.`);
	},
};
