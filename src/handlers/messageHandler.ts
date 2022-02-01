import { type Message, MessageActionRow, MessageButton, NewsChannel, TextChannel } from "discord.js";
import { getConfig } from "../helpers/configHelpers";
import { getMessage, resetMessageContext, addMessageContext, isAutoThreadChannel, getHelpButton } from "../helpers/messageHelpers";
import { getRequiredPermissions, getSafeDefaultAutoArchiveDuration } from "../helpers/permissionHelpers";

export async function handleMessageCreate(message: Message): Promise<void> {
	const clientUser = message.client.user;

	// Server outage
	if (!message.guild?.available) return;

	// Not logged in
	if (clientUser === null) return;

	const authorUser = message.author;
	const authorMember = message.member;
	const guild = message.guild;
	const channel = message.channel;

	if (message.system) return;
	if (authorUser.bot) return; // TODO: Make configurable, some users want this to be allowed (in certain channels)
	if (!channel.isText()) return;
	if (!(channel instanceof TextChannel) && !(channel instanceof NewsChannel)) return;
	if (message.hasThread) return;
	if (!isAutoThreadChannel(channel.id, guild.id)) return;

	const botMember = await guild.members.fetch(clientUser);
	const botPermissions = botMember.permissionsIn(message.channel.id);
	const requiredPermissions = getRequiredPermissions();
	if (!botPermissions.has(requiredPermissions)) {
		try {
			const missing = botPermissions.missing(requiredPermissions);
			const errorMessage = `Missing permission${missing.length > 1 ? "s" : ""}:`;
			await message.channel.send(`${errorMessage}\n    - ${missing.join("\n    - ")}`);
		}
		catch (e) {
			console.log(e);
		}
		return;
	}

	addMessageContext({
		user: authorUser,
		channel: channel,
		message: message,
	});

	const creationDate = message.createdAt.toISOString().slice(0, 10);
	const authorName = authorMember === null || authorMember.nickname === null
		? authorUser.username
		: authorMember.nickname;

	const thread = await message.startThread({
		name: `${authorName} (${creationDate})`,
		autoArchiveDuration: getSafeDefaultAutoArchiveDuration(channel),
	});

	const closeButton = new MessageButton()
		.setCustomId("close")
		.setLabel("Archive thread")
		.setStyle("SUCCESS")
		.setEmoji("937932140014866492"); // :archive:

	const helpButton = getHelpButton();

	const buttonRow = new MessageActionRow().addComponents(closeButton, helpButton);

	const overrideMessageContent = getConfig(guild.id).threadChannels?.find(x => x?.channelId === channel.id)?.messageContent;
	const msgContent = overrideMessageContent
		? overrideMessageContent
		: getMessage("SUCCESS_THREAD_CREATE");

	if (msgContent && msgContent.length > 0) {
		await thread.send({
			content: msgContent,
			components: [buttonRow],
		});
	}

	await thread.leave();
	resetMessageContext();
}
