import {
	ActionRowBuilder,
	AnyThreadChannel,
	ButtonBuilder,
	ButtonStyle,
	Message,
	NewsChannel,
	PermissionFlagsBits,
	TextChannel,
	ThreadAutoArchiveDuration,
} from "discord.js";
import { getRequiredPermissions } from "../helpers/djsHelpers";
import { wait } from "../helpers/promiseHelpers";
import { clampWithElipse, extractRegex, plural } from "../helpers/stringHelpers";
import AutothreadChannelConfig from "../models/AutothreadChannelConfig";
import ReplyMessageOption from "../models/enums/ReplyMessageOption";
import ToggleOption from "../models/enums/ToggleOption";
import MessageVariables from "../models/MessageVariables";
import type NeedleBot from "../NeedleBot";

export default class InformationService {
	private readonly bot: NeedleBot;

	constructor(bot: NeedleBot) {
		this.bot = bot;
	}

	public async shouldHaveThread(message: Message): Promise<boolean> {
		if (message.system) return false;
		if (!message.inGuild()) return false;
		if (!message.channel.isTextBased()) return false;
		if (message.channel.isThread()) return false;
		if (message.channel.isVoiceBased()) return false;
		if (!message.guild?.available) return false;
		if (message.author.id === message.client.user?.id) return false;
		if (message.hasThread) return false;

		const guildConfig = this.bot.configs.get(message.guildId);
		const channelConfig = guildConfig.threadChannels?.find(c => c.channelId === message.channelId);
		if (!channelConfig) return false;
		if (!channelConfig.includeBots && message.author.bot) return false;

		return true;
	}

	public async createThreadOnMessage(
		message: Message,
		messageVariables: MessageVariables
	): Promise<AnyThreadChannel | undefined> {
		if (!message.inGuild()) return;
		if (!(message.channel instanceof TextChannel) && !(message.channel instanceof NewsChannel)) return;

		const guildConfig = this.bot.configs.get(message.guildId);
		const channelConfig = guildConfig.threadChannels?.find(c => c.channelId === message.channelId);
		if (!channelConfig) return;

		const botMember = await message.guild.members.fetchMe();
		const useDefaultMessage = channelConfig.replyType === ReplyMessageOption.Default;
		const rawReplyMessageContent = useDefaultMessage
			? guildConfig.settings.SuccessThreadCreated
			: channelConfig.customReply;
		const replyMessageContent = await messageVariables.replace(rawReplyMessageContent);
		const botPermissions = botMember.permissionsIn(message.channel.id);
		const requiredPermissions = getRequiredPermissions(channelConfig.slowmode, replyMessageContent);
		if (!botPermissions.has(requiredPermissions)) {
			const missing = botPermissions.missing(requiredPermissions);
			const errorMessage = `Missing ${plural("permission", missing.length)}:`;
			await message.channel.send(`${errorMessage}\n    - ${missing.join("\n    - ")}`);
			return;
		}

		const name = await this.getThreadName(message, channelConfig, messageVariables);
		const thread = await message.startThread({
			name,
			rateLimitPerUser: channelConfig.slowmode,
			autoArchiveDuration: message.channel.defaultAutoArchiveDuration ?? ThreadAutoArchiveDuration.OneDay,
		});

		messageVariables.setThread(thread);

		if (channelConfig.statusReactions === ToggleOption.On) {
			await message.react(guildConfig.settings.EmojiUnanswered);
		}

		if (replyMessageContent.trim().length > 0) {
			const buttonRow = await this.getButtonRow(channelConfig, messageVariables);
			const msg = await thread.send({
				content: clampWithElipse(replyMessageContent, 2000),
				components: buttonRow.components.length > 0 ? [buttonRow] : undefined,
			});

			if (botMember.permissionsIn(thread.id).has(PermissionFlagsBits.ManageMessages)) {
				await msg.pin();
				await wait(100); // Let's wait a few ms here to ensure the latest message is actually the pin message
				await thread.lastMessage?.delete();
			}
		}

		// Maybe we should check here if a system message was generated for the thread
	}

	private async getThreadName(
		message: Message,
		config: AutothreadChannelConfig,
		variables: MessageVariables
	): Promise<string> {
		const content = variables.removeFrom(message.content);
		const result = extractRegex(config.customTitle);
		const regexResult = result.regex && content.match(result.regex);
		const rawTitle = result.inputWithRegexVariable
			.replace("$REGEXRESULT", regexResult?.join("") ?? "") // TODO: make join character configurable?
			.replaceAll("\n", " ");

		const title = await variables.replace(rawTitle);
		const output = clampWithElipse(title, config.titleMaxLength);
		return output.length > 0 ? output : "New Thread";
	}

	private async getButtonRow(
		config: AutothreadChannelConfig,
		messageVariables: MessageVariables
	): Promise<ActionRowBuilder<ButtonBuilder>> {
		const closeButtonText = clampWithElipse(await messageVariables.replace(config.closeButtonText), 80);
		const titleButtonText = clampWithElipse(await messageVariables.replace(config.titleButtonText), 80);
		const closeButtonStyle = this.getButtonStyle(config.closeButtonStyle);
		const titleButtonStyle = this.getButtonStyle(config.titleButtonStyle);

		const buttonRow = new ActionRowBuilder<ButtonBuilder>();
		if (closeButtonText.length > 0) {
			const closeButton = ButtonBuilder.from(this.bot.getButton("close").getBuilder())
				.setStyle(closeButtonStyle)
				.setLabel(closeButtonText);
			buttonRow.addComponents(closeButton);
		}
		if (titleButtonText.length > 0) {
			const titleButton = ButtonBuilder.from(this.bot.getButton("title").getBuilder())
				.setStyle(titleButtonStyle)
				.setLabel(titleButtonText);
			buttonRow.addComponents(titleButton);
		}

		return buttonRow;
	}

	// Temporary thing before we get dropdowns in modals
	private getButtonStyle(setting: string): ButtonStyle {
		switch (setting.toLowerCase()) {
			case "blurple":
				return ButtonStyle.Primary;
			case "green":
				return ButtonStyle.Success;
			case "grey":
				return ButtonStyle.Secondary;
			case "red":
				return ButtonStyle.Danger;
			default:
				throw new Error("Invalid button color: " + setting.toLowerCase());
		}
	}
}