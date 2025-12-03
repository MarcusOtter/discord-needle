import { ClientEvents } from "discord.js";
import NeedleEventListener from "../models/NeedleEventListener.js";
import ListenerRunType from "../models/enums/ListenerRunType.js";
import ThreadCreationService from "../services/ThreadCreationService.js";
import NeedleBot from "../NeedleBot.js";
import ObjectFactory from "../ObjectFactory.js";
import MessageVariables from "../models/MessageVariables.js";

export default class MessageUpdateEventListener extends NeedleEventListener {
	public readonly name = "messageUpdate";
	public readonly runType = ListenerRunType.EveryTime;

	private readonly threadCreator: ThreadCreationService;

	constructor(bot: NeedleBot) {
		super(bot);
		this.threadCreator = ObjectFactory.createThreadCreationService(false);
	}

	public async handle([oldMessage, newMessage]: ClientEvents["messageUpdate"]): Promise<void> {
		await newMessage.fetch();

		if (!newMessage.hasThread) return;
		if (newMessage.thread?.ownerId !== this.bot.client.user?.id) return;
		if (!oldMessage.inGuild() || !newMessage.inGuild()) return;

		const guildConfig = this.bot.configs.get(newMessage.guildId);
		const channelConfig = guildConfig.threadChannels?.find(
			c => c.channelId === newMessage.channelId || c.channelId === newMessage.channel.parentId,
		);

		if (!channelConfig) return;

		const oldMessageVariables = new MessageVariables()
			.setChannel(oldMessage.channel)
			.setUser(oldMessage.member ?? oldMessage.author)
			.setThread(oldMessage.thread);

		const newMessageVariables = new MessageVariables()
			.setChannel(newMessage.channel)
			.setUser(newMessage.member ?? newMessage.author)
			.setThread(newMessage.thread);

		const expectedOldName = await this.threadCreator.getThreadName(oldMessage, channelConfig, oldMessageVariables);
		const actualOldName = oldMessage.thread?.name ?? "";
		// If the previous title is the default title, do not overwrite it
		if (expectedOldName !== actualOldName) return;

		await this.threadCreator.createOrUpdateThreadOnMessage(newMessage, newMessageVariables);
	}
}
