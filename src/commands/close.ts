import { GuildMember, GuildTextBasedChannel, ThreadAutoArchiveDuration } from "discord.js";
import { isAllowedToArchiveThread, removeUserReactionsOnMessage } from "../helpers/djsHelpers.js";
import CommandCategory from "../models/enums/CommandCategory.js";
import InteractionContext from "../models/InteractionContext.js";
import NeedleCommand from "../models/NeedleCommand.js";

export default class CloseCommand extends NeedleCommand {
	public readonly name = "close";
	public readonly description = "Close a thread";
	public readonly category = CommandCategory.ThreadOnly;

	public async hasPermissionToExecuteHere(member: GuildMember, channel: GuildTextBasedChannel): Promise<boolean> {
		if (!channel.isThread()) return false;

		const hasBasePermissions = await super.hasPermissionToExecuteHere(member, channel);
		if (!hasBasePermissions) return false;

		return isAllowedToArchiveThread(channel, member);
	}

	public async execute(context: InteractionContext): Promise<void> {
		const { settings, replyInSecret, replyInPublic, replyWithErrors } = context;
		if (!context.isInThread()) {
			return replyWithErrors();
		}

		const { interaction, messageVariables } = context;
		const { channel: thread, member } = context.interaction;
		const userHasPermission = await isAllowedToArchiveThread(thread, member);
		const botHasPermission = await isAllowedToArchiveThread(thread, thread.guild.members.me);

		if (!userHasPermission) return replyInSecret(settings.ErrorInsufficientUserPerms);
		if (!botHasPermission) return replyInSecret(settings.ErrorInsufficientBotPerms);

		messageVariables.setThread(thread);
		const config = this.bot.configs.get(thread.guildId);
		const threadConfig = config.threadChannels.find(c => c.channelId === thread.parentId);
		const shouldArchiveImmediately = threadConfig?.archiveImmediately ?? true;
		const archiveMessage = await messageVariables.replace(settings.SuccessThreadArchived);

		if (!shouldArchiveImmediately && thread.autoArchiveDuration === ThreadAutoArchiveDuration.OneHour) {
			return replyInSecret(settings.ErrorNoEffect);
		}

		if (interaction.isButton()) {
			// https://github.com/MarcusOtter/discord-needle/pull/90
			await interaction.update({ content: interaction.message.content });
			await thread.send({ content: archiveMessage });
		} else {
			await replyInPublic(archiveMessage);
		}

		if (shouldArchiveImmediately) {
			await thread.setArchived(true);
		} else {
			await thread.setAutoArchiveDuration(ThreadAutoArchiveDuration.OneHour);

			if (threadConfig?.statusReactions) {
				const starterMessage = await thread.fetchStarterMessage();
				if (!starterMessage) return;

				const botMember = await thread.guild.members.fetchMe();
				await removeUserReactionsOnMessage(starterMessage, botMember.id);
				await starterMessage?.react(config.settings.EmojiArchived);
			}
		}
	}
}
