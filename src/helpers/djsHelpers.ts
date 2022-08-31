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

import type {
	AnyThreadChannel,
	GuildMember,
	Message,
	User,
	TextInputBuilder,
	ModalActionRowComponentBuilder,
} from "discord.js";
import { PermissionFlagsBits, ActionRowBuilder } from "discord.js";
import type { Nullish } from "./typeHelpers.js";

export async function removeUserReactionsOnMessage(message: Message, userId: string) {
	const userReactions = message.reactions.cache.filter(r => r.users.cache.has(userId));
	for (const reaction of userReactions.values()) {
		await reaction.users.remove(userId);
	}
}

export async function isAllowedToChangeThreadTitle(
	thread: AnyThreadChannel,
	member: Nullish<GuildMember>
): Promise<boolean> {
	if (!member) return false;

	const hasManageThreads = member.permissionsIn(thread).has(PermissionFlagsBits.ManageThreads);
	if (hasManageThreads) return true;

	const isThreadOwner = thread.ownerId === member.id;
	if (isThreadOwner) return true;

	const threadAuthor = await getThreadAuthor(thread);
	const isThreadAuthor = threadAuthor?.id === member.id;
	if (isThreadAuthor) return true;

	return false;
}

export function makeRow(input: TextInputBuilder): ActionRowBuilder<ModalActionRowComponentBuilder> {
	return new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(input);
}

export async function tryReact(message: Nullish<Message>, emoji: string): Promise<boolean> {
	if (!message) return false;

	try {
		await message.react(emoji);
		return true;
	} catch (e) {
		console.error(e);
		return false;
	}
}

export async function getThreadAuthor(thread: AnyThreadChannel): Promise<User | undefined> {
	const starterMessage = await thread
		.fetchStarterMessage()
		.catch(() => console.log(`Could not find starter message for ${thread.id}`));

	return starterMessage?.author;
}

export function getRequiredPermissions(slowmode?: number, threadMessage?: string): bigint[] {
	const output = [
		PermissionFlagsBits.ViewChannel,
		PermissionFlagsBits.SendMessages,
		PermissionFlagsBits.CreatePublicThreads,
		PermissionFlagsBits.ReadMessageHistory,
	];

	if (slowmode && slowmode > 0) {
		output.push(PermissionFlagsBits.ManageThreads);
	}

	if (threadMessage && threadMessage.trim().length > 0) {
		output.push(PermissionFlagsBits.SendMessagesInThreads);
	}

	return output;
}

export function getMinimumRequiredPermissions(): bigint {
	return PermissionFlagsBits.UseApplicationCommands | PermissionFlagsBits.SendMessages;
}

export function isAllowedToArchiveThread(thread: AnyThreadChannel, member: Nullish<GuildMember>): Promise<boolean> {
	return isAllowedToChangeThreadTitle(thread, member);
}
