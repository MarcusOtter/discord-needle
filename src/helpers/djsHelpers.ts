import { AnyThreadChannel, GuildMember, Message, PermissionFlagsBits, User } from "discord.js";
import { Nullish } from "./typeHelpers.js";

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
