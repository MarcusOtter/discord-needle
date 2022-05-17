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

import {
	type Message,
	MessageActionRow,
	MessageButton,
	NewsChannel,
	TextChannel,
	ThreadChannel,
	SnowflakeUtil,
	type Snowflake,
	Permissions,
} from "discord.js";
import { emojisEnabled, getConfig, includeBotsForAutothread, getSlowmodeSeconds } from "../helpers/configHelpers";
import {
	getMessage,
	resetMessageContext,
	addMessageContext,
	isAutoThreadChannel,
	getHelpButton,
	replaceMessageVariables,
	getThreadAuthor,
} from "../helpers/messageHelpers";
import { getRequiredPermissions } from "../helpers/permissionHelpers";
import { wait } from "../helpers/promiseHelpers";

export async function handleMessageCreate(message: Message): Promise<void> {
	// Server outage
	if (!message.guild?.available) return;

	// Not logged in
	if (message.client.user === null) return;

	if (message.system) return;
	if (!message.channel.isText()) return;
	if (!message.inGuild()) return;
	if (message.author.id === message.client.user.id) return;

	const includeBots = includeBotsForAutothread(message.guild.id, message.channel.id);
	if (!includeBots && message.author.bot) return;

	if (!message.author.bot && message.channel.isThread()) {
		await updateTitle(message.channel, message);
		return;
	}

	const requestId = SnowflakeUtil.generate();
	await autoCreateThread(message, requestId);
	resetMessageContext(requestId);
}

async function updateTitle(thread: ThreadChannel, message: Message) {
	if (message.author.bot) return;

	const threadAuthor = await getThreadAuthor(thread);
	// this might have a bug? object equality
	if (message.author === threadAuthor) return;

	await thread.setName(thread.name.replace("🆕", ""));
}

async function autoCreateThread(message: Message, requestId: Snowflake) {
	// Server outage
	if (!message.guild?.available) return;

	// Not logged in
	if (message.client.user === null) return;

	const authorUser = message.author;
	const authorMember = message.member;
	const guild = message.guild;
	const channel = message.channel;

	if (!(channel instanceof TextChannel) && !(channel instanceof NewsChannel)) return;
	if (message.hasThread) return;
	if (!isAutoThreadChannel(channel.id, guild.id)) return;

	const slowmode = getSlowmodeSeconds(guild.id, channel.id);

	const botMember = await guild.members.fetch(message.client.user);
	const botPermissions = botMember.permissionsIn(message.channel.id);
	const requiredPermissions = getRequiredPermissions(slowmode);
	if (!botPermissions.has(requiredPermissions)) {
		try {
			const missing = botPermissions.missing(requiredPermissions);
			const errorMessage = `Missing permission${missing.length > 1 ? "s" : ""}:`;
			await message.channel.send(`${errorMessage}\n    - ${missing.join("\n    - ")}`);
		} catch (e) {
			console.log(e);
		}
		return;
	}

	addMessageContext(requestId, {
		user: authorUser,
		channel: channel,
		message: message,
	});

	const creationDate = message.createdAt.toISOString().slice(0, 10);
	const authorName =
		authorMember === null || authorMember.nickname === null ? authorUser.username : authorMember.nickname;

	const name = emojisEnabled(guild) ? `🆕 ${authorName} (${creationDate})` : `${authorName} (${creationDate})`;

	const thread = await message.startThread({
		name,
		rateLimitPerUser: slowmode,
		autoArchiveDuration: channel.defaultAutoArchiveDuration ?? 1440, // 24h
	});

	const closeButton = new MessageButton()
		.setCustomId("close")
		.setLabel("Archive thread")
		.setStyle("SUCCESS")
		.setEmoji("937932140014866492"); // :archive:

	const helpButton = getHelpButton();

	const buttonRow = new MessageActionRow().addComponents(closeButton, helpButton);

	const overrideMessageContent = getConfig(guild.id).threadChannels?.find(
		x => x?.channelId === channel.id
	)?.messageContent;

	const msgContent = overrideMessageContent
		? replaceMessageVariables(overrideMessageContent, requestId)
		: getMessage("SUCCESS_THREAD_CREATE", requestId);

	if (msgContent && msgContent.length > 0) {
		const msg = await thread.send({
			content: msgContent,
			components: [buttonRow],
		});

		if (botMember.permissionsIn(thread.id).has(Permissions.FLAGS.MANAGE_MESSAGES)) {
			await msg.pin();
			await wait(50); // Let's wait a few ms here to ensure the latest message is actually the pin message
			await thread.lastMessage?.delete();
		}
	}

	resetMessageContext(requestId);
}
