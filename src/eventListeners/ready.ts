import { Client, ClientEvents } from "discord.js";
import ListenerRunType from "../models/enums/ListenerRunType";
import MessageVariables from "../models/MessageVariables";
import NeedleEventListener from "../models/NeedleEventListener";
import NeedleBot from "../NeedleBot";
import ObjectFactory from "../ObjectFactory";
import ThreadCreationService from "../services/ThreadCreationService";

export default class ReadyEventListener extends NeedleEventListener {
	public readonly name = "ready";
	public readonly runType = ListenerRunType.OnlyOnce;

	private readonly threadCreator: ThreadCreationService;

	constructor(bot: NeedleBot) {
		super(bot);
		this.threadCreator = ObjectFactory.createThreadCreationService();
	}

	public async handle(...[client]: ClientEvents["ready"]): Promise<void> {
		// TODO: Delete unknown configs from servers

		try {
			await this.createMissingThreads(client);
		} catch {
			console.error("Failed creating missing threads");
		}

		console.log("Ready!");
	}

	private async createMissingThreads(client: Client) {
		const configs = this.bot.configs.getAll(true);
		for (const [guildId, config] of configs) {
			const guild = client.guilds.cache.get(guildId);
			if (!guild) continue;

			for (const autoThreadChannel of config.threadChannels) {
				const channel = await guild.channels.fetch(autoThreadChannel.channelId);
				if (!channel || !channel.isTextBased()) continue;

				const lastMessage = (await channel.messages.fetch({ limit: 1 })).first();
				if (!lastMessage) continue;

				const shouldHaveThread = await this.threadCreator.shouldHaveThread(lastMessage);
				if (!shouldHaveThread) continue;

				const latestTenMessages = await channel.messages.fetch({ limit: 10 });
				await Promise.all(
					latestTenMessages.map(async m => {
						// In the future if we have prerequisites we need to check those here
						const createThread = await this.threadCreator.shouldHaveThread(m);
						if (!createThread) return Promise.resolve();

						const { author, member } = m;
						const messageVariables = new MessageVariables().setChannel(channel).setUser(member ?? author);
						return this.threadCreator.createThreadOnMessage(m, messageVariables);
					})
				);
			}
		}
	}
}
