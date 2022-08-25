import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChannelType,
	ClientEvents,
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
import ReplyMessageOption from "../models/enums/ReplyMessageOption";
import MessageVariables from "../models/MessageVariables";
import NeedleEventListener from "../models/NeedleEventListener";

export default class MessageCreateEventListener extends NeedleEventListener {
	public readonly name = "messageCreate";
	public readonly runType = ListenerRunType.EveryTime;

	// TODO: Double check we don't have instance variables on commands or event listeners as storage,
	// Because the listeners and commands themselves are not instantiated per request, only once when imported.

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

		const { settings } = guildConfig;
		const { author, member, guild, channel } = message;
		const botMember = await guild.members.fetchMe();
		const messageVariables = new MessageVariables().setChannel(channel).setUser(member ?? author);

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

		// TODO: Definitely clean this content first and remove all attempts of injecting message variables
		const name = await this.getThreadName(message.content, channelConfig, messageVariables);
		const thread = await message.startThread({
			name,
			rateLimitPerUser: channelConfig.slowmode,
			autoArchiveDuration: channel.defaultAutoArchiveDuration ?? ThreadAutoArchiveDuration.OneDay,
		});
		if (thread.type === ChannelType.GuildPublicThread) {
			messageVariables.setThread(thread);
		}

		const closeButtonText = clampWithElipse(await messageVariables.replace(channelConfig.closeButtonText), 80);
		const titleButtonText = clampWithElipse(await messageVariables.replace(channelConfig.titleButtonText), 80);
		const closeButtonStyle = this.getButtonStyle(channelConfig.closeButtonStyle);
		const titleButtonStyle = this.getButtonStyle(channelConfig.titleButtonStyle);

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

		const rawMessageContent =
			channelConfig.replyType === ReplyMessageOption.Default
				? settings.SuccessThreadCreated
				: channelConfig.customReply;
		const messageContent = await messageVariables.replace(rawMessageContent);
		if (messageContent.length > 0) {
			const msg = await thread.send({
				content: clampWithElipse(messageContent, 2000),
				components: buttonRow.components.length > 0 ? [buttonRow] : undefined,
			});

			if (botMember.permissionsIn(thread.id).has(PermissionsBitField.Flags.ManageMessages)) {
				await msg.pin();
				await wait(100); // Let's wait a few ms here to ensure the latest message is actually the pin message
				await thread.lastMessage?.delete();
			}
		}
	}

	private async getThreadName(
		message: string,
		config: AutothreadChannelConfig,
		variables: MessageVariables
	): Promise<string> {
		const result = extractRegex(config.customTitle);
		const regexResult = result.regex && message.match(result.regex);
		const rawTitle = result.inputWithRegexVariable
			.replace("$REGEXRESULT", regexResult?.join("") ?? "")
			.replaceAll("\n", " ");

		const title = await variables.replace(rawTitle);
		const output = clampWithElipse(title, config.titleMaxLength);
		return output.length > 0 ? output : "New Thread";
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
