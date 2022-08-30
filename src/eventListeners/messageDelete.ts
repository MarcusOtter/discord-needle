import { ClientEvents, PermissionFlagsBits } from "discord.js";
import DeleteBehavior from "../models/enums/DeleteBehavior";
import ListenerRunType from "../models/enums/ListenerRunType";
import NeedleEventListener from "../models/NeedleEventListener";

export default class MessageDeleteEventListener extends NeedleEventListener {
	public readonly name = "messageDelete";
	public readonly runType = ListenerRunType.EveryTime;

	public async handle([message]: ClientEvents["messageDelete"]): Promise<void> {
		const thread = message.thread;
		if (!thread || !thread.isThread()) return;
		if (!message.inGuild()) return;

		const guildConfig = this.bot.configs.get(message.guildId);
		const autoThreadConfig = guildConfig.threadChannels.find(x => x.channelId === message.channelId);
		const deleteBehavior = autoThreadConfig?.deleteBehavior;
		const botGuildMember = await thread.guild.members.fetchMe();
		const botHasDeletePermissions = botGuildMember
			.permissionsIn(message.channel)
			.has(PermissionFlagsBits.ManageThreads);

		if (deleteBehavior === undefined) return;
		if (deleteBehavior === DeleteBehavior.Nothing) return;

		if (deleteBehavior === DeleteBehavior.Archive) {
			await thread.setArchived(true, "Start message was deleted.");
			return;
		}

		if (botHasDeletePermissions && deleteBehavior === DeleteBehavior.Delete) {
			await thread.delete("Start message was deleted.");
			return;
		}

		if (deleteBehavior !== DeleteBehavior.DeleteIfEmptyElseArchive) return;

		let isEmptyThread = true;
		const threadMessages = await thread.messages.fetch();

		for (const threadMessage of threadMessages.values()) {
			if (threadMessage.author.id !== message.author?.id && threadMessage.author.id !== botGuildMember.id) {
				isEmptyThread = false;
				break;
			}
		}

		if (botHasDeletePermissions && isEmptyThread) {
			await thread.delete("Start message was deleted.");
		} else {
			await thread.setArchived(true, "Start message was deleted.");
		}
	}
}
