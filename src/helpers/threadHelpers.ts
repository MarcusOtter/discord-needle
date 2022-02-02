// Preserves the prepended unicode emoji!
// Current rate limit is 2 renames per thread per 10 minutes (2021-09-17).

import type { ThreadChannel } from "discord.js";

// If that rate limit is hit, it will wait here until it is able to rename the thread.
export function setThreadName(thread: ThreadChannel, name: string): Promise<ThreadChannel> {
	const emoji = getEmojiStatus(thread);
	const newName = emoji
		? `${emoji} ${name}`
		: name;

	return thread.setName(newName);
}

export async function setEmojiStatus(thread: ThreadChannel, unicodeEmoji: string): Promise<boolean> {
	if (!isOneUnicodeEmoji(unicodeEmoji)) return false;
	const currentEmoji = thread.name.split(" ")[0];
	await thread.setName(thread.name.replace(currentEmoji, unicodeEmoji));
	return true;
}

export function getEmojiStatus(thread: ThreadChannel): string | undefined {
	const emoji = thread.name.split(" ")[0];
	return isOneUnicodeEmoji(emoji) ? emoji : undefined;
}

// Derived from https://stackoverflow.com/a/64007175/10615308
function isOneUnicodeEmoji(text: string) {
	return /^\p{Extended_Pictographic}$/u.test(text);
}
