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

import { type ClientEvents, PermissionFlagsBits } from "discord.js";
import DeleteBehavior from "../models/enums/DeleteBehavior.js";
import ListenerRunType from "../models/enums/ListenerRunType.js";
import NeedleEventListener from "../models/NeedleEventListener.js";

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
