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

import type { ClientEvents } from "discord.js";
import { removeUserReactionsOnMessage, tryReact } from "../helpers/djsHelpers.js";
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
			await tryReact(startMessage, guildConfig.settings.EmojiLocked);
			return;
		}

		if (threadWasArchived) {
			await removeUserReactionsOnMessage(startMessage, botMember.id);
			await tryReact(startMessage, guildConfig.settings.EmojiArchived);
		}

		// Also applies for unlocked
		if (threadWasUnarchived) {
			await removeUserReactionsOnMessage(startMessage, botMember.id);
			return;
		}
	}
}
