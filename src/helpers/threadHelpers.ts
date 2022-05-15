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

import type { ThreadChannel } from "discord.js";
import { emojisEnabled } from "./configHelpers";

// If that rate limit is hit, it will wait here until it is able to rename the thread.
export function setThreadName(thread: ThreadChannel, name: string): Promise<ThreadChannel> {
	const emoji = getEmojiStatus(thread);
	const newName = emoji ? `${emoji} ${name}` : name;

	return thread.setName(newName);
}

// Preserves the prepended unicode emoji!
// Current rate limit is 2 renames per thread per 10 minutes (2021-09-17).
export async function setEmojiStatus(thread: ThreadChannel, unicodeEmoji: string): Promise<boolean> {
	if (!isOneUnicodeEmoji(unicodeEmoji)) return false;
	const currentEmoji = thread.name.split(" ")[0];
	// TODO: Check if there actually is a current emoji, if not just prepend the new emoji
	await thread.setName(thread.name.replace(currentEmoji, unicodeEmoji));
	return true;
}

export function getEmojiStatus(thread: ThreadChannel): string | undefined {
	const emoji = thread.name.split(" ")[0];
	return isOneUnicodeEmoji(emoji) ? emoji : undefined;
}

export function setEmojiForNewThread(thread: ThreadChannel, shouldBeNew: boolean): Promise<ThreadChannel> {
	const hasNewEmoji = thread.name.includes("🆕");
	if (shouldBeNew === hasNewEmoji) return Promise.resolve(thread);

	if (shouldBeNew && !emojisEnabled(thread.guild)) return Promise.resolve(thread);

	return shouldBeNew ? thread.setName(`🆕 ${thread.name}`) : thread.setName(thread.name.replaceAll("🆕", ""));
}

// Derived from https://stackoverflow.com/a/64007175/10615308
function isOneUnicodeEmoji(text: string) {
	return /^\p{Extended_Pictographic}$/u.test(text);
}
