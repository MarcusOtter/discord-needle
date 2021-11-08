import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember, MessageComponentInteraction, Permissions } from "discord.js";
import { interactionReply, getThreadStartMessage, getMessage } from "../helpers/messageHelpers";
import { NeedleCommand } from "../types/needleCommand";

export const command: NeedleCommand = {
	name: "close",
	shortHelpDescription: "Closes a thread by setting the auto-archive duration to 1 hour",
	longHelpDescription: "The close command archives a thread by setting the auto-archive duration to 1 hour.\n\nIt does not instantly archive the thread, because that would mean only moderators could un-archive it. When using auto-archive, the thread will automatically be archived when there have been no new messages in the thread for one hour.",

	async getSlashCommandBuilder() {
		return new SlashCommandBuilder()
			.setName("close")
			.setDescription("Closes a thread by setting the auto-archive duration to 1 hour")
			.toJSON();
	},

	async execute(interaction: CommandInteraction | MessageComponentInteraction): Promise<void> {
		const member = interaction.member;
		if (!(member instanceof GuildMember)) {
			return interactionReply(interaction, getMessage("ERR_UNKNOWN"));
		}

		const channel = interaction.channel;
		if (!channel?.isThread()) {
			return interactionReply(interaction, getMessage("ERR_ONLY_IN_THREAD"));
		}

		const parentMessage = await getThreadStartMessage(channel);
		if (!parentMessage) {
			return interactionReply(interaction, getMessage("ERR_UNKNOWN"));
		}

		const hasChangeTitlePermissions = member.permissionsIn(channel).has(Permissions.FLAGS.MANAGE_THREADS, true);
		if (!hasChangeTitlePermissions && parentMessage.author !== interaction.user) {
			return interactionReply(interaction, getMessage("ERR_ONLY_THREAD_OWNER"));
		}

		if (channel.autoArchiveDuration === 60) {
			return interactionReply(interaction, getMessage("ERR_NO_EFFECT"));
		}

		await channel.setAutoArchiveDuration(60);
		await interactionReply(interaction, getMessage("SUCCESS_THREAD_ARCHIVE"), false);
	},
};
