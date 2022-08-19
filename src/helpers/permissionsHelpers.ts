import { GuildMember, PermissionsBitField, PublicThreadChannel, User } from "discord.js";
import { Nullish } from "./typeHelpers";

export async function isAllowedToChangeThreadTitle(
	thread: PublicThreadChannel,
	member: Nullish<GuildMember>
): Promise<boolean> {
	if (!member) return false;

	const hasManageThreads = member.permissionsIn(thread).has(PermissionsBitField.Flags.ManageThreads);
	if (hasManageThreads) return true;

	const isThreadOwner = thread.ownerId === member.id;
	if (isThreadOwner) return true;

	const threadAuthor = await getThreadAuthor(thread);
	const isThreadAuthor = threadAuthor?.id === member.id;
	if (isThreadAuthor) return true;

	// TODO: Implement https://github.com/MarcusOtter/discord-needle/issues/68
	// Before we had some code here to determine thread author using pings (if starter msg was null)

	return false;
}

export async function getThreadAuthor(thread: PublicThreadChannel): Promise<User | undefined> {
	const starterMessage = await thread.fetchStarterMessage().catch(e => console.error(e));
	return starterMessage?.author;
}

export function getRequiredPermissions(slowmode?: number): bigint[] {
	const output = [
		PermissionsBitField.Flags.ViewChannel,
		PermissionsBitField.Flags.SendMessages,
		PermissionsBitField.Flags.SendMessagesInThreads,
		PermissionsBitField.Flags.CreatePublicThreads,
		PermissionsBitField.Flags.ReadMessageHistory,
	];

	if (slowmode && slowmode > 0) {
		output.push(PermissionsBitField.Flags.ManageThreads);
	}

	return output;
}

// TODO: use PermissionFlagsBits instead in the whole bot
export function getMinimumRequiredPermissions(): bigint {
	return PermissionsBitField.Flags.UseApplicationCommands | PermissionsBitField.Flags.SendMessages;
}

export function isAllowedToArchiveThread(thread: PublicThreadChannel, member: Nullish<GuildMember>): Promise<boolean> {
	return isAllowedToChangeThreadTitle(thread, member);
}