import { Message, MessageEmbed } from "discord.js";
import { getConfig } from "../helpers/configHelpers";
import { getRequiredPermissions } from "../helpers/permissionHelpers";

export async function handleMessageCreate(message: Message): Promise<void> {
	const clientUser = message.client.user;
	const config = getConfig();

	// Server outage
	if (!message.guild?.available) return;

	// Not logged in
	if (clientUser === null) return;

	const authorUser = message.author;
	const authorMember = message.member;
	const guild = message.guild;
	const channel = message.channel;

	if (message.system) return;
	if (authorUser.bot) return;
	if (!channel.isText()) return;
	if (message.hasThread) return;
	if (!config?.threadChannels?.includes(channel.id)) return;

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

	const creationDate = message.createdAt.toISOString().slice(0, 10);
	const authorName = authorMember === null || authorMember.nickname === null
		? authorUser.username
		: authorMember.nickname;

	const thread = await message.startThread({
		name: `${authorName} (${creationDate})`,
		autoArchiveDuration: <60 | 1440 | 4320 | 10080 | "MAX"> config.threadArchiveDuration,
	});

	const embed = new MessageEmbed()
		.setAuthor(authorName, authorUser.displayAvatarURL())
		.setDescription(message.content)
		.setColor([255, 94, 0]);

	const channelMention = `<#${channel.id}>`;
	const relativeTimestamp = `<t:${Math.round(message.createdTimestamp / 1000)}:R>`;

	const threadMsg = await thread.send({
		embeds: [embed],
		content: `Thread created from ${channelMention} by <@${authorUser.id}> ${relativeTimestamp} with the following message:`,
	});

	await threadMsg.pin();
	await thread.leave();
}