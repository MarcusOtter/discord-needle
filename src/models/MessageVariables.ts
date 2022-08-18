import { GuildMember, GuildTextBasedChannel, PublicThreadChannel, User } from "discord.js";
import { getThreadAuthor } from "../helpers/permissionsHelpers";
import { Nullish } from "../helpers/typeHelpers";

// TODO: Rename to placeholders?
export default class MessageVariables {
	private channel: Nullish<GuildTextBasedChannel>;
	private thread: Nullish<PublicThreadChannel>;
	private user: Nullish<GuildMember | User>;

	public setChannel(channel: Nullish<GuildTextBasedChannel>): MessageVariables {
		this.channel = channel;
		return this;
	}

	public setThread(thread: Nullish<PublicThreadChannel>): MessageVariables {
		this.thread = thread;
		return this;
	}

	public setUser(user: Nullish<GuildMember | User>): MessageVariables {
		this.user = user;
		return this;
	}

	public async replace(input: string): Promise<string> {
		const threadAuthor = this.thread && (await getThreadAuthor(this.thread));
		const user = this.user instanceof GuildMember ? this.user.user : this.user;
		const userName = this.user instanceof GuildMember ? this.user.displayName : user?.username;

		return input
			.replaceAll(MessageVariable.ChannelMention, this.channel ? `<#${this.channel.id}>` : "")
			.replaceAll(MessageVariable.ChannelName, this.channel ? this.channel.name : "")
			.replaceAll(MessageVariable.DateUtc, new Date().toISOString().slice(0, 10)) // Localize in the future
			.replaceAll(MessageVariable.ThreadMention, this.thread ? `<#${this.thread.id}>` : "")
			.replaceAll(MessageVariable.ThreadName, this.thread ? this.thread.name : "")
			.replaceAll(MessageVariable.ThreadAuthorMention, threadAuthor ? `<@${threadAuthor.id}>` : "")
			.replaceAll(MessageVariable.ThreadAuthorName, threadAuthor ? threadAuthor.username : "")
			.replaceAll(MessageVariable.ThreadAuthorTag, threadAuthor ? threadAuthor.tag : "")
			.replaceAll(MessageVariable.TimeAgo, `<t:${Math.round(Date.now() / 1000)}:R>`)
			.replaceAll(MessageVariable.UserTag, user?.tag ?? "")
			.replaceAll(MessageVariable.UserMention, this.user ? `<@${this.user.id}>` : "")
			.replaceAll(MessageVariable.UserName, userName ?? "");
	}
}

// TODO: Message content
enum MessageVariable {
	ChannelMention = "$CHANNEL_MENTION",
	ChannelName = "$CHANNEL_NAME",
	DateUtc = "$DATE_UTC",
	ThreadMention = "$THREAD_MENTION",
	ThreadName = "$THREAD_NAME",
	ThreadAuthorMention = "$THREAD_AUTHOR_MENTION",
	ThreadAuthorName = "$THREAD_AUTHOR_NAME",
	ThreadAuthorTag = "$THREAD_AUTHOR_TAG",
	TimeAgo = "$TIME_AGO",
	UserMention = "$USER_MENTION",
	UserName = "$USER_NAME",
	UserTag = "$USER_DISCRIMINATOR",
}
