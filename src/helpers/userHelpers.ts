import { GuildMember } from "discord.js";

export function getNicknameOrUsername(member: GuildMember | null, includeDiscriminator = true): string | null {
	if (!member) { return null; }
	if (member.nickname) { return member.nickname; }

	return includeDiscriminator
		? member.user.tag
		: member.user.username;
}
