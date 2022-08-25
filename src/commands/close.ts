import { ChannelType, GuildMember, GuildTextBasedChannel, ThreadAutoArchiveDuration } from "discord.js";
import { isAllowedToArchiveThread } from "../helpers/permissionsHelpers";
import CommandCategory from "../models/enums/CommandCategory";
import InteractionContext from "../models/InteractionContext";
import NeedleCommand from "../models/NeedleCommand";

export default class CloseCommand extends NeedleCommand {
	public readonly name = "close";
	public readonly description = "Close a thread";
	public readonly category = CommandCategory.ThreadOnly;

	public async hasPermissionToExecuteHere(member: GuildMember, channel: GuildTextBasedChannel): Promise<boolean> {
		const hasBasePermissions = await super.hasPermissionToExecuteHere(member, channel);
		if (!hasBasePermissions) return false;

		if (channel.type !== ChannelType.GuildPublicThread) return false;
		return isAllowedToArchiveThread(channel, member);
	}

	public async execute(context: InteractionContext): Promise<void> {
		const { settings, replyInSecret, replyInPublic } = context;
		if (!context.isInPublicThread()) {
			return replyInSecret(context.validationError);
		}

		const { interaction, messageVariables } = context;
		const { channel: thread, member } = context.interaction;
		const userHasPermission = await isAllowedToArchiveThread(thread, member);
		const botHasPermission = await isAllowedToArchiveThread(thread, thread.guild.members.me);

		if (!userHasPermission) return replyInSecret(settings.ErrorInsufficientUserPerms);
		if (!botHasPermission) return replyInSecret(settings.ErrorInsufficientBotPerms); // TODO: check if it works, untested

		messageVariables.setThread(thread);
		const config = this.bot.configs.get(thread.guildId);
		const threadConfig = config.threadChannels.find(c => c.channelId === thread.parentId);
		const shouldArchiveImmediately = threadConfig?.archiveImmediately ?? true;
		const archiveMessage = await messageVariables.replace(settings.SuccessThreadArchived);

		// TODO: Do something with thread emojis here... maybe reactions...

		// https://github.com/MarcusOtter/discord-needle/pull/90

		if (!shouldArchiveImmediately && thread.autoArchiveDuration === ThreadAutoArchiveDuration.OneHour) {
			return replyInSecret(settings.ErrorNoEffect);
		}

		if (interaction.isButton()) {
			await interaction.update({ content: interaction.message.content });
			await thread.send({ content: archiveMessage });
		} else {
			await replyInPublic(archiveMessage);
		}

		if (shouldArchiveImmediately) {
			await thread.setArchived(true);
		} else {
			await thread.setAutoArchiveDuration(ThreadAutoArchiveDuration.OneHour);
		}
	}
}
