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
	PermissionFlagsBits,
} from "discord.js";
import { getRequiredPermissions } from "../helpers/permissionsHelpers";
import { wait } from "../helpers/promiseHelpers";
import { clampWithElipse, extractRegex, hasUrl, plural } from "../helpers/stringHelpers";
import AutothreadChannelConfig from "../models/AutothreadChannelConfig";
import ListenerRunType from "../models/enums/ListenerRunType";
import TitleType from "../models/enums/TitleFormat";
import NeedleEventListener from "../models/NeedleEventListener";

export default class MessageCreateEventListener extends NeedleEventListener {
	public readonly name = "messageCreate";
	public readonly runType = ListenerRunType.EveryTime;

	public async handle(...[message]: ClientEvents["messageCreate"]): Promise<void> {
		if (message.system || !message.channel.isTextBased() || !message.inGuild()) return;

		const guildConfig = this.bot.configs.get(message.guildId);
		const channelConfig = guildConfig.threadChannels?.find(c => c.channelId === message.channelId);
		if (!channelConfig) return;
		if (!channelConfig.includeBots && message.author.bot) return;

		if (this.shouldWaitForEmbed(message, channelConfig)) {
			await wait(2000); // maybe embed exists now ¯\_(ツ)_/¯
			message = await message.fetch();
		}

		if (!message.guild?.available) return; // Server outage
		if (!(message.channel instanceof TextChannel) && !(message.channel instanceof NewsChannel)) return;
		if (message.author.id === message.client.user?.id) return;
		if (message.hasThread) return;

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
		if (config.titleType === TitleType.DiscordDefault) return this.generateDefaultThreadName(message);

		const result = extractRegex(config.customTitle);
		const regexResult = result.regex && message.content.match(result.regex);
		let title = result.inputWithRegexVariable
			.replace("$REGEXRESULT", regexResult?.join("") ?? "")
			.replaceAll("\n", " ");

		if (config.titleType === TitleType.FirstFourtyChars) {
			title = message.content > title ? title + "..." : title;
		}

		return clampWithElipse(title, 100, true);
	}

	private shouldWaitForEmbed(message: Message, config: AutothreadChannelConfig): boolean {
		return (
			config.titleType === TitleType.DiscordDefault &&
			this.mayContainEmbed(message) &&
			message.embeds.length === 0
		);
	}

	private mayContainEmbed(message: Message): boolean {
		const permissions = message.member?.permissionsIn(message.channelId);
		if (!permissions?.has(PermissionFlagsBits.EmbedLinks)) return false;
		if (!hasUrl(message.content)) return false;
		return true;
	}

	// This is an approximation of Discord's own algorithm done in the Discord client
	// It does not, however, strip away invalid characters like dots and slashes.
	// https://github.com/discord/discord-api-docs/discussions/5326
	private generateDefaultThreadName(message: Message): string {
		// I also include alt text from attachments, which Discord does not do.
		const attachmentText = message.attachments.first()?.description;
		if (attachmentText && attachmentText.length > 0) return clampWithElipse(attachmentText, 40);

		const embedTitle = message.embeds.length > 0 && message.embeds[0].title;
		if (embedTitle && embedTitle.length > 0) return clampWithElipse(embedTitle, 40);

		const words = message.content.split(/\s/);
		let output = "";
		for (const word of words) {
			if (output.length + word.length > 41) break;
			output += word + " ";
		}

		if (words.length > 0 && output.length === 0) {
			output = clampWithElipse(words[0], 40);
		}

		// For example, if you posted an attachment without alt text and without content
		if (output.length === 0) {
			output = "New Thread";
		}

		// Discord probably has an off by one error with message content,
		// making them possible to be 41 chars instead of 40 like embed titles
		return clampWithElipse(output.trim(), 41);
	}
}
