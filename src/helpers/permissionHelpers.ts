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

import { type GuildMember, Permissions } from "discord.js";

export function getRequiredPermissions(slowmode?: number): bigint[] {
	const output = [
		Permissions.FLAGS.VIEW_CHANNEL,
		Permissions.FLAGS.SEND_MESSAGES,
		Permissions.FLAGS.SEND_MESSAGES_IN_THREADS,
		Permissions.FLAGS.CREATE_PUBLIC_THREADS,
		Permissions.FLAGS.READ_MESSAGE_HISTORY,
	];

	if (slowmode && slowmode > 0) {
		output.push(Permissions.FLAGS.MANAGE_THREADS);
	}

	return output;
}

export function memberIsModerator(member: GuildMember): boolean {
	return member.permissions.has(Permissions.FLAGS.KICK_MEMBERS);
}

export function memberIsAdmin(member: GuildMember): boolean {
	return member.permissions.has(Permissions.FLAGS.ADMINISTRATOR);
}
