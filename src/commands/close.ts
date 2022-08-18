import { ThreadAutoArchiveDuration } from "discord.js";
import { isAllowedToArchiveThread } from "../helpers/permissionsHelpers";
import CommandCategory from "../models/enums/CommandCategory";
import InteractionContext from "../models/InteractionContext";
import NeedleCommand from "../models/NeedleCommand";

export default class CloseCommand extends NeedleCommand {
	public readonly name = "close";
	public readonly description = "Close a thread";
	public readonly category = CommandCategory.ThreadOnly;

	public async execute(context: InteractionContext): Promise<void> {
		const { messages, replyInSecret, replyInPublic } = context;
		if (!context.isInPublicThread()) {
			return replyInSecret(context.validationError);
		}

		const { interaction } = context;
		const { channel: thread, member } = context.interaction;
		const userHasPermission = await isAllowedToArchiveThread(thread, member);
		const botHasPermission = await isAllowedToArchiveThread(thread, thread.guild.members.me);

		if (!userHasPermission) return replyInSecret(messages.ERR_INSUFFICIENT_PERMS);
		if (!botHasPermission) return replyInSecret("Oh nooo"); // TODO: Make message key for bot not having permissions to change title in thread

		context.messageVariables.setThread(thread);
		const config = this.bot.configs.get(thread.guildId);
		const threadConfig = config.threadChannels.find(c => c.channelId === thread.parentId);
		const shouldArchiveImmediately = threadConfig?.archiveImmediately ?? true;
		const archiveMessage = shouldArchiveImmediately
			? messages.SUCCESS_THREAD_ARCHIVE_IMMEDIATE
			: messages.SUCCESS_THREAD_ARCHIVE_SLOW;

		// https://github.com/MarcusOtter/discord-needle/pull/90
		if (interaction.isButton()) {
			await interaction.update({ content: interaction.message.content });
			await thread.send({ content: archiveMessage });
		} else if (interaction.isChatInputCommand() && shouldArchiveImmediately) {
			await replyInPublic(archiveMessage);
		}

		// TODO: Do something with thread emojis here... maybe reactions...

		if (shouldArchiveImmediately) {
			await thread.setArchived(true);
			return;
		}

		if (thread.autoArchiveDuration === ThreadAutoArchiveDuration.OneHour) {
			return replyInSecret(messages.ERR_NO_EFFECT);
		}

		await thread.setAutoArchiveDuration(ThreadAutoArchiveDuration.OneHour);
		await replyInPublic(archiveMessage);
	}
}
