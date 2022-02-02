// ________________________________________________________________________________________________
//
// This file is part of Needle.
//
// Needle is free software: you can redistribute it and/or modify it under the terms of the GNU
// Affero General Public License as published by the Free Software Foundation, either version 3 of
// the License, or (at your option) any later version.
//
// Needle is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even
// the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero
// General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License along with Needle.
// If not, see <https://www.gnu.org/licenses/>.
//
// ________________________________________________________________________________________________

import type { ThreadChannel } from "discord.js";

export async function handleThreadUpdate(oldThread: ThreadChannel, newThread: ThreadChannel): Promise<void> {
	const threadWasArchived = !oldThread.archived && newThread.archived;
	const threadWasUnarchived = oldThread.archived && !newThread.archived;

	if (!threadWasArchived && !threadWasUnarchived) return;

	// WIP!

	if (threadWasArchived) {
		// Cannot change title, it's archived
		return;
	}

	if (threadWasUnarchived) {
		// await setEmojiForNewThread(newThread, true);
		return;
	}

	// const millisecondsPerHour = 1000 * 60 * 60;
	// const differenceInMs = Date.now() - (newThread.lastMessage?.createdAt.getTime() ?? 0);

	// lastMessageId
	// autoArchiveDuration
	// archiveTimestamp
	// locked
}
