/*
This file is part of Needle.

Needle is free software: you can redistribute it and/or modify it under the terms of the GNU
Affero General Public License as published by the Free Software Foundation, either version 3 of
the License, or (at your option) any later version.

Needle is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even
the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero
General Public License for more details.

You should have received a copy of the GNU Affero General Public License along with Needle.
If not, see <https://www.gnu.org/licenses/>.
*/

import type { Client, ClientEvents } from "discord.js";
import ListenerRunType from "../models/enums/ListenerRunType.js";
import MessageVariables from "../models/MessageVariables.js";
import NeedleEventListener from "../models/NeedleEventListener.js";
import type NeedleBot from "../NeedleBot.js";
import ObjectFactory from "../ObjectFactory.js";
import type ThreadCreationService from "../services/ThreadCreationService.js";

export default class ReadyEventListener extends NeedleEventListener {
	public readonly name = "ready";
	public readonly runType = ListenerRunType.OnlyOnce;

	private readonly threadCreator: ThreadCreationService;

	constructor(bot: NeedleBot) {
		super(bot);
		this.threadCreator = ObjectFactory.createThreadCreationService();
	}

	public async handle([client]: ClientEvents["ready"]): Promise<void> {
		await this.bot.configs.deleteFromUnknownServers(this.bot);

		if (process.argv.includes("--skip-catch-up")) {
			console.log("Ready!");
			return;
		}

		try {
			await this.createMissingThreads(client);
		} catch (e) {
			console.error("Failed creating missing threads");
			console.error(e);
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
