import { GuildMember, PermissionsBitField, PublicThreadChannel } from "discord.js";
import { Nullable } from "./typeHelpers";

export async function isAllowedToChangeThreadTitle(
	thread: PublicThreadChannel,
	member: Nullable<GuildMember>
): Promise<boolean> {
	if (!member) return false;

	const hasManageThreads = member.permissionsIn(thread).has(PermissionsBitField.Flags.ManageThreads);
	if (hasManageThreads) return true;

	const isThreadOwner = thread.ownerId === member.id;
	if (isThreadOwner) return true;

	const starterMessage = await thread.fetchStarterMessage().catch(e => console.error(e));
	const isThreadAuthor = starterMessage?.author.id === member.id;
	if (isThreadAuthor) return true;

	// TODO: Implement https://github.com/MarcusOtter/discord-needle/issues/68
	// Before we had some code here to determine thread author using pings (if starter msg was null)

	return false;
}

export function isAllowedToArchiveThread(thread: PublicThreadChannel, member: Nullable<GuildMember>): Promise<boolean> {
	return isAllowedToChangeThreadTitle(thread, member);
}
