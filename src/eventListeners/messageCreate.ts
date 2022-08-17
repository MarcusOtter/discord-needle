import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ClientEvents,
	Message,
	NewsChannel,
	PermissionsBitField,
	TextChannel,
	ThreadAutoArchiveDuration,
} from "discord.js";
import { getRequiredPermissions } from "../helpers/permissionsHelpers";
import { wait } from "../helpers/promiseHelpers";
import { clampWithElipse, extractRegex, plural } from "../helpers/stringHelpers";
import AutothreadChannelConfig from "../models/AutothreadChannelConfig";
import ListenerRunType from "../models/enums/ListenerRunType";
import TitleType from "../models/enums/TitleFormat";
import NeedleEventListener from "../models/NeedleEventListener";

export default class MessageCreateEventListener extends NeedleEventListener {
	public readonly name = "messageCreate";
	public readonly runType = ListenerRunType.EveryTime;

	public async handle(...[message]: ClientEvents["messageCreate"]): Promise<void> {
		if (message.system || !message.channel.isTextBased() || !message.inGuild()) return;
		if (!message.guild?.available) return;
		if (!(message.channel instanceof TextChannel) && !(message.channel instanceof NewsChannel)) return;
		if (message.author.id === message.client.user?.id) return;
		if (message.hasThread) return;

		const guildConfig = this.bot.configs.get(message.guildId);
		const channelConfig = guildConfig.threadChannels?.find(c => c.channelId === message.channelId);
		if (!channelConfig) return;
		if (!channelConfig.includeBots && message.author.bot) return;

		const { author, member, guild, channel } = message;
		const botMember = await guild.members.fetchMe();

		// TODO: If message is in a thread, change the emoji and remove new emoji
		// if (!message.author.bot && message.channel.type === ChannelType.GuildPublicThread) {
		// 	await updateTitle(message.channel, message);
		// 	return;
		// }

		const botPermissions = botMember.permissionsIn(message.channel.id);
		const requiredPermissions = getRequiredPermissions(channelConfig.slowmode);
		if (!botPermissions.has(requiredPermissions)) {
			const missing = botPermissions.missing(requiredPermissions);
			const errorMessage = `Missing ${plural("permission", missing.length)}:`;
			await message.channel.send(`${errorMessage}\n    - ${missing.join("\n    - ")}`);
			return;
		}

		// addMessageContext(requestId, {
		// 	user: authorUser,
		// 	channel: channel,
		// 	message: message,
		// });

		// const creationDate = message.createdAt.toISOString().slice(0, 10);
		// const authorName = member?.nickname ?? author.username;

		const name = this.getThreadName(message, channelConfig);
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

		// TODO: Use correct amount of buttons and all that
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

	private getThreadName(message: Message, config: AutothreadChannelConfig): string {
		const result = extractRegex(config.customTitle);
		const regexResult = result.regex && message.content.match(result.regex);
		const title = result.inputWithRegexVariable
			.replace("$REGEXRESULT", regexResult?.join("") ?? "")
			.replaceAll("\n", " ");

		if (config.titleType === TitleType.FirstFourtyChars) {
			return message.content.length > 40 ? title + "..." : title;
		}

		return clampWithElipse(title, 100);
	}
}
