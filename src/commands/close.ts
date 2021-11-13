import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember, MessageComponentInteraction, MessageEmbed, Permissions } from "discord.js";
import { ephemeralReply, getThreadStartMessage } from "../helpers/messageHelpers";
import { NeedleCommand } from "../types/needleCommand";

export const command: NeedleCommand = {
	name: "close",
	shortHelpDescription: "Closes a thread by setting the auto-archive duration to 1 hour",
	longHelpDescription: "The close command lets thread owners set the auto-archive duration to 1 hour.\n\nWhen using auto-archive, the thread will automatically be archived when there have been no new messages in the thread for one hour. This can be undone by a server moderator by manually changing the auto-archive duration back to what it was previously, using Discord's own interface.",

	async getSlashCommandBuilder() {
		return new SlashCommandBuilder()
			.setName("close")
			.setDescription("Closes a thread by setting the auto-archive duration to 1 hour")
			.toJSON();
	},

	async execute(interaction: CommandInteraction | MessageComponentInteraction): Promise<void> {
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
			return ephemeralReply(interaction, "You need to be the thread owner to close the thread.");
		}

		if (channel.autoArchiveDuration === 60) {
			return ephemeralReply(interaction, "This server already has the auto-archive duration set to one hour.");
		}

		const previousAutoArchiveDuration = !channel.autoArchiveDuration || channel.autoArchiveDuration === "MAX"
			? ""
			: ` (${channel.autoArchiveDuration / 60} hours)`;

		await channel.setAutoArchiveDuration(60);
		await interaction.reply({ embeds: [
			new MessageEmbed()
				.setTitle("This thread will be archived soon  🗃️") // :card_box:
				.setDescription(`As requested by <@${member.id}>, this thread will automatically be archived when one hour passes without any new messages.\n\nThe thread's content will still be searchable with Discord's search function, and anyone will be able to un-archive it at any point in the future by simply sending a message in the thread again.\n\nIf you believe this was an error, you can ask a server moderator to undo this by setting the auto-archive duration back to what it was previously${previousAutoArchiveDuration}.`),
		] });
	},
};
