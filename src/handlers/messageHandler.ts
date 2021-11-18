import { Message, MessageActionRow, MessageButton, NewsChannel, TextChannel } from "discord.js";
import { getConfig } from "../helpers/configHelpers";
import { getMessage, resetMessageContext, addMessageContext } from "../helpers/messageHelpers";
import { getRequiredPermissions } from "../helpers/permissionHelpers";

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
	if (authorUser.bot) return;
	if (!channel.isText()) return;
	if (!(channel instanceof TextChannel) && !(channel instanceof NewsChannel)) return;
	if (message.hasThread) return;

	const config = getConfig();
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

	addMessageContext({
		invoker: authorUser,
		sourceChannel: channel,
		sourceMessage: message,
	});

	const creationDate = message.createdAt.toISOString().slice(0, 10);
	const authorName = authorMember === null || authorMember.nickname === null
		? authorUser.username
		: authorMember.nickname;

	const thread = await message.startThread({
		name: `${authorName} (${creationDate})`,
		autoArchiveDuration: channel.defaultAutoArchiveDuration,
	});

	const closeButton = new MessageButton()
		.setCustomId("close")
		.setLabel("Archive thread")
		.setStyle("DANGER")
		.setEmoji("🗃️");

	const buttonRow = new MessageActionRow().addComponents(closeButton);

	await thread.send({
		content: getMessage("SUCCESS_THREAD_CREATE"),
		components: [buttonRow],
	});

	await thread.leave();
	resetMessageContext();
}
