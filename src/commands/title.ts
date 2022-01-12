import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember, Permissions } from "discord.js";
import { interactionReply, getThreadStartMessage, getMessage } from "../helpers/messageHelpers";
import type { NeedleCommand } from "../types/needleCommand";

export const command: NeedleCommand = {
	name: "title",
	shortHelpDescription: "Sets the title of a thread to `value`",
	longHelpDescription: "The title command changes the title of a thread.",

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
			return interactionReply(interaction, getMessage("ERR_UNKNOWN"));
		}

		const channel = interaction.channel;
		if (!channel?.isThread()) {
			return interactionReply(interaction, getMessage("ERR_ONLY_IN_THREAD"));
		}

		const newThreadName = interaction.options.getString("value");
		if (!newThreadName) {
			return interactionReply(interaction, getMessage("ERR_PARAMETER_MISSING"));
		}

		const oldThreadName = channel.name;

		if (oldThreadName === newThreadName) {
			return interactionReply(interaction, getMessage("ERR_NO_EFFECT"));
		}

		const hasChangeTitlePermissions = member.permissionsIn(channel).has(Permissions.FLAGS.MANAGE_THREADS, true);
		if (hasChangeTitlePermissions) {
			await channel.setName(newThreadName, `Changed by ${member.user.tag} (${member.id})`);
			await interaction.reply(`Successfully changed title from \`${oldThreadName}\` to \`${newThreadName}\`.`);
			return;
		}

		const parentMessage = await getThreadStartMessage(channel);
		if (!parentMessage) {
			return interactionReply(interaction, getMessage("ERR_THREAD_MESSAGE_MISSING"));
		}

		if (parentMessage.author !== interaction.user) {
			return interactionReply(interaction, getMessage("ERR_ONLY_THREAD_OWNER"));
		}

		// Current rate limit is 2 renames per thread per 10 minutes (2021-09-17).
		// If that rate limit is hit, it will wait here until it is able to rename the thread.
		await channel.setName(newThreadName, `Changed by ${member.user.tag} (${member.id})`);
		await interaction.reply(`Successfully changed title from \`${oldThreadName}\` to \`${newThreadName}\`.`);
	},
};
