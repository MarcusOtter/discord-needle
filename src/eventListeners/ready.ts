import { ClientEvents } from "discord.js";
import ListenerRunType from "../models/enums/ListenerRunType";
import NeedleEventListener from "../models/NeedleEventListener";

export default class ReadyEventListener extends NeedleEventListener {
	public readonly name = "ready";
	public readonly runType = ListenerRunType.OnlyOnce;

	public async handle(...[client]: ClientEvents["ready"]): Promise<void> {
		// TODO: Delete unknown configs from servers

		const configs = this.bot.configs.getAll(true);
		for (const [guildId, config] of configs) {
			const guild = client.guilds.cache.get(guildId);
			if (!guild) continue;

			for (const autoThreadChannel of config.threadChannels) {
				const channel = await guild.channels.fetch(autoThreadChannel.channelId);
				if (!channel || !channel.isTextBased()) continue;

				const lastMessage = (await channel.messages.fetch({ limit: 1 })).first();
				if (!lastMessage) continue;

				// TODO: We nede to make some checks here to figure out if it should even be threaded
				// Like if it's a system message or stuff like that we can't

				if (lastMessage.hasThread) continue;

				// In the future if we have prerequisites we need to check those here
				const messagesWithoutThreads = (await channel.messages.fetch({ limit: 10 })).filter(m => !m.hasThread);

				// TODO: Actually make it properly
				Promise.all(messagesWithoutThreads.map(m => m.startThread({ name: "You were missing a thread" })));
			}
		}

		console.log("Ready!");

		// TODO: Loop through all auto-thread channels, check latest message. If it doesn't have a thread (and should have a thread on it), try to create a thread on it.
		// Repeat this process for other missed messages in said channel until we find one with a thread that should have a thread.
		// We might run into rate limits if bot has been offline for a long time, so we should probably also have some flag that
		// says if we should skip this process. By default it should be on though, I think.

		// Make sure to fetch the message too, because then we can start catching deletes on it
		// If we wanted to be really fancy we could also fetch threads without starting message (if config wants to delete them)
	}
}
