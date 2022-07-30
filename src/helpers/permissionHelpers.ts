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

import { type GuildMember, PermissionsBitField } from "discord.js";

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

export function memberIsModerator(member: GuildMember): boolean {
	return member.permissions.has(PermissionsBitField.Flags.KickMembers);
}

export function memberIsAdmin(member: GuildMember): boolean {
	return member.permissions.has(PermissionsBitField.Flags.Administrator);
}
