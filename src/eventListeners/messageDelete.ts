import { ChannelType, ClientEvents } from "discord.js";
import DeleteBehavior from "../models/enums/DeleteBehavior";
import ListenerRunType from "../models/enums/ListenerRunType";
import NeedleEventListener from "../models/NeedleEventListener";

export default class MessageDeleteEventListener extends NeedleEventListener {
	public readonly name = "messageDelete";
	public readonly runType = ListenerRunType.EveryTime;

	public async handle(...[message]: ClientEvents["messageDelete"]): Promise<void> {
		const thread = message.thread;
		if (!thread || thread.type !== ChannelType.GuildPublicThread) return;
		if (!message.guildId) return;

		const guildConfig = this.bot.configs.get(message.guildId);
		const autoThreadConfig = guildConfig.threadChannels.find(x => x.channelId === message.channelId);
		const deleteBehavior = autoThreadConfig?.deleteBehavior;

		if (deleteBehavior === undefined) return;
		if (deleteBehavior === DeleteBehavior.Nothing) return;

		if (deleteBehavior === DeleteBehavior.Archive) {
			await thread.setArchived(true, "Start message was deleted.");
			return;
		}

		if (deleteBehavior === DeleteBehavior.Delete) {
			await thread.delete("Start message was deleted.");
			return;
		}

		if (deleteBehavior !== DeleteBehavior.DeleteIfEmptyElseArchive) return;

		let isEmptyThread = true;
		const threadMessages = await thread.messages.fetch();
		const botGuildMember = await thread.guild.members.fetchMe();

		for (const threadMessage of threadMessages.values()) {
			if (threadMessage.author.id !== message.author?.id && threadMessage.author.id !== botGuildMember.id) {
				isEmptyThread = false;
				break;
			}
		}

		if (isEmptyThread) {
			await thread.delete("Start message was deleted.");
		} else {
			await thread.setArchived(true, "Start message was deleted.");
		}
	}
}
