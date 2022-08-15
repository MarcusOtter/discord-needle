import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ClientEvents,
	NewsChannel,
	PermissionsBitField,
	TextChannel,
	ThreadAutoArchiveDuration,
} from "discord.js";
import { getRequiredPermissions } from "../helpers/permissionsHelpers";
import { wait } from "../helpers/promiseHelpers";
import { plural } from "../helpers/stringHelpers";
import ListenerRunType from "../models/enums/ListenerRunType";
import NeedleEventListener from "../models/NeedleEventListener";

export default class MessageCreateEventListener extends NeedleEventListener {
	public readonly name = "messageCreate";
	public readonly runType = ListenerRunType.EveryTime;

	public async handle(...[message]: ClientEvents["messageCreate"]): Promise<void> {
		if (!message.guild?.available) return; // Server outage
		if (message.client.user === null) return; // Not logged in
		if (message.system) return;
		if (!message.channel.isTextBased()) return;
		if (!message.inGuild()) return;
		if (!(message.channel instanceof TextChannel) && !(message.channel instanceof NewsChannel)) return;
		if (message.author.id === message.client.user.id) return;

		const guildConfig = this.bot.configs.get(message.guildId);
		const channelConfig = guildConfig.threadChannels.find(c => c.channelId === message.channelId);
		if (!channelConfig) return;

		const authorUser = message.author;
		const authorMember = message.member;
		const guild = message.guild;
		const channel = message.channel;

		if (!channelConfig.includeBots && message.author.bot) return;
		if (message.hasThread) return;

		// TODO: If message is in a thread, change the emoji and remove new emoji
		// if (!message.author.bot && message.channel.type === ChannelType.GuildPublicThread) {
		// 	await updateTitle(message.channel, message);
		// 	return;
		// }

		const botMember = await guild.members.fetch(message.client.user);
		const botPermissions = botMember.permissionsIn(message.channel.id);
		const requiredPermissions = getRequiredPermissions(channelConfig.slowmode);
		if (!botPermissions.has(requiredPermissions)) {
			try {
				const missing = botPermissions.missing(requiredPermissions);
				const errorMessage = `Missing ${plural("permission", missing.length)}:`;
				await message.channel.send(`${errorMessage}\n    - ${missing.join("\n    - ")}`);
			} catch (e) {
				console.log(e);
			}
			return;
		}

		// addMessageContext(requestId, {
		// 	user: authorUser,
		// 	channel: channel,
		// 	message: message,
		// });

		const creationDate = message.createdAt.toISOString().slice(0, 10);
		const authorName = authorMember?.nickname ?? authorUser.username;
		const name = `${authorName} (${creationDate})`; // TODO: Get correct format

		const thread = await message.startThread({
			name,
			rateLimitPerUser: channelConfig.slowmode,
			autoArchiveDuration: channel.defaultAutoArchiveDuration ?? ThreadAutoArchiveDuration.OneDay,
		});

		const closeButton = new ButtonBuilder()
			.setCustomId("close")
			.setLabel("Archive thread") // TODO: Message variable
			.setStyle(ButtonStyle.Success)
			.setEmoji("937932140014866492"); // :archive:

		const helpButton = await this.bot.getButton("help")?.getBuilder();
		if (!helpButton) return;

		const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(closeButton, helpButton);

		const msgContent =
			channelConfig.customReply.length > 0
				? channelConfig.customReply
				: guildConfig.messages.SUCCESS_THREAD_CREATE;

		// ? replaceMessageVariables(overrideMessageContent, requestId)
		// : getMessage("SUCCESS_THREAD_CREATE", requestId);

		if (msgContent && msgContent.length > 0) {
			const msg = await thread.send({
				content: msgContent,
				components: [buttonRow],
			});

			if (botMember.permissionsIn(thread.id).has(PermissionsBitField.Flags.ManageMessages)) {
				await msg.pin();
				await wait(50); // Let's wait a few ms here to ensure the latest message is actually the pin message
				await thread.lastMessage?.delete();
			}
		}

		// resetMessageContext(requestId);
	}
}
