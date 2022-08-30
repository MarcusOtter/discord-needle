import type { ClientEvents } from "discord.js";
import { removeUserReactionsOnMessage } from "../helpers/djsHelpers.js";
import ListenerRunType from "../models/enums/ListenerRunType.js";
import NeedleEventListener from "../models/NeedleEventListener.js";

export default class ThreadUpdateEventListener extends NeedleEventListener {
	public readonly name = "threadUpdate";
	public runType = ListenerRunType.EveryTime;

	public async handle([oldThread, newThread]: ClientEvents["threadUpdate"]): Promise<void> {
		const threadWasArchived = !oldThread.archived && newThread.archived;
		const threadWasUnarchived = oldThread.archived && !newThread.archived;
		const threadWasLocked = !oldThread.locked && newThread.locked;
		const guildConfig = this.bot.configs.get(newThread.guildId);
		const channelConfig = guildConfig.threadChannels.find(c => c.channelId === newThread.parentId);

		if (!channelConfig) return;
		if (!channelConfig.statusReactions) return;

		const startMessage = await newThread.fetchStarterMessage();
		const botMember = await newThread.guild.members.fetchMe();

		if (!startMessage) return;
		if (threadWasLocked) {
			await removeUserReactionsOnMessage(startMessage, botMember.id);
			await startMessage.react(guildConfig.settings.EmojiLocked);
			return;
		}

		if (threadWasArchived) {
			await removeUserReactionsOnMessage(startMessage, botMember.id);
			await startMessage.react(guildConfig.settings.EmojiArchived);
		}

		// Also applies for unlocked
		if (threadWasUnarchived) {
			await removeUserReactionsOnMessage(startMessage, botMember.id);
			return;
		}
	}
}
