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

import { type AnyThreadChannel, GuildMember, type GuildTextBasedChannel, type User } from "discord.js";
import { getThreadAuthor } from "../helpers/djsHelpers.js";
import type { Nullish } from "../helpers/typeHelpers.js";

export default class MessageVariables {
	private channel: Nullish<GuildTextBasedChannel>;
	private thread: Nullish<AnyThreadChannel>;
	private user: Nullish<GuildMember | User>;

	public setChannel(channel: Nullish<GuildTextBasedChannel>): MessageVariables {
		this.channel = channel;
		return this;
	}

	public setThread(thread: Nullish<AnyThreadChannel>): MessageVariables {
		this.thread = thread;
		return this;
	}

	public setUser(user: Nullish<GuildMember | User>): MessageVariables {
		this.user = user;
		return this;
	}

	public async replace(input: string): Promise<string> {
		if (input.length === 0) return "";

		const threadUser = this.thread && (await getThreadAuthor(this.thread));
		const threadMember = this.thread && threadUser && (await this.thread.members.fetch(threadUser.id));

		const user = this.user instanceof GuildMember ? this.user.user : this.user;
		const userName = user?.username ?? "";
		const userDisplayName = this.user instanceof GuildMember ? this.user.displayName : userName;

		const threadUserName = threadUser?.username ?? "";
		const threadDisplayName = threadMember?.guildMember?.displayName ?? threadUserName;

		return input
			.replaceAll(MessageVariable.ChannelMention, this.channel ? `<#${this.channel.id}>` : "")
			.replaceAll(MessageVariable.ChannelName, this.channel ? this.channel.name : "")
			.replaceAll(MessageVariable.DateUtc, new Date().toISOString().slice(0, 10)) // Localize in the future
			.replaceAll(MessageVariable.ThreadMention, this.thread ? `<#${this.thread.id}>` : "")
			.replaceAll(MessageVariable.ThreadName, this.thread ? this.thread.name : "")
			.replaceAll(MessageVariable.ThreadAuthorMention, threadUser ? `<@${threadUser.id}>` : "")
			.replaceAll(MessageVariable.ThreadAuthorNickname, threadDisplayName)
			.replaceAll(MessageVariable.ThreadAuthorName, threadUser ? threadUser.username : "")
			.replaceAll(MessageVariable.ThreadAuthorTag, threadUser ? threadUser.tag : "")
			.replaceAll(MessageVariable.TimeAgo, `<t:${Math.round(Date.now() / 1000)}:R>`)
			.replaceAll(MessageVariable.UserMention, this.user ? `<@${this.user.id}>` : "")
			.replaceAll(MessageVariable.UserNickname, userDisplayName)
			.replaceAll(MessageVariable.UserName, userName ?? "")
			.replaceAll(MessageVariable.UserTag, user?.tag ?? "");
	}

	public removeFrom(input: string): string {
		return input
			.replaceAll(MessageVariable.ChannelMention, "")
			.replaceAll(MessageVariable.ChannelName, "")
			.replaceAll(MessageVariable.DateUtc, "")
			.replaceAll(MessageVariable.ThreadMention, "")
			.replaceAll(MessageVariable.ThreadName, "")
			.replaceAll(MessageVariable.ThreadAuthorMention, "")
			.replaceAll(MessageVariable.ThreadAuthorNickname, "")
			.replaceAll(MessageVariable.ThreadAuthorName, "")
			.replaceAll(MessageVariable.ThreadAuthorTag, "")
			.replaceAll(MessageVariable.TimeAgo, "")
			.replaceAll(MessageVariable.UserMention, "")
			.replaceAll(MessageVariable.UserNickname, "")
			.replaceAll(MessageVariable.UserName, "")
			.replaceAll(MessageVariable.UserTag, "");
	}
}

enum MessageVariable {
	ChannelMention = "$CHANNEL_MENTION",
	ChannelName = "$CHANNEL_NAME",
	DateUtc = "$DATE_UTC",
	ThreadMention = "$THREAD_MENTION",
	ThreadName = "$THREAD_NAME",
	ThreadAuthorMention = "$THREAD_AUTHOR_MENTION",
	ThreadAuthorNickname = "$THREAD_AUTHOR_NICKNAME",
	ThreadAuthorName = "$THREAD_AUTHOR_NAME",
	ThreadAuthorTag = "$THREAD_AUTHOR_TAG",
	TimeAgo = "$TIME_AGO",
	UserMention = "$USER_MENTION",
	UserNickname = "$USER_NICKNAME",
	UserName = "$USER_NAME",
	UserTag = "$USER_TAG",
}
