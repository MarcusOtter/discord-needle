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
import TitleType from "../models/enums/TitleFormat";
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

		const name = await this.getThreadName(message.content, channelConfig, messageVariables);
		const thread = await message.startThread({
			name,
			rateLimitPerUser: channelConfig.slowmode,
			autoArchiveDuration: channel.defaultAutoArchiveDuration ?? ThreadAutoArchiveDuration.OneDay,
		});
		if (thread.type === ChannelType.GuildPublicThread) {
			messageVariables.setThread(thread);
		}

		const closeButton = new ButtonBuilder()
			.setCustomId("close")
			.setLabel("Archive thread") // TODO: Message key
			.setStyle(ButtonStyle.Success)
			.setEmoji("937932140014866492"); // :archive:

		const helpButton = await this.bot.getButton("help").getBuilder();
		const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(closeButton, helpButton);

		const rawMessageContent =
			channelConfig.customReply.length > 0
				? channelConfig.customReply
				: guildConfig.messages.SUCCESS_THREAD_CREATE;
		const messageContent = await messageVariables.replace(rawMessageContent);
		// TODO: Use correct amount of buttons and all that
		if (messageContent.length > 0) {
			const msg = await thread.send({
				content: clampWithElipse(messageContent, 2000),
				components: [buttonRow],
			});

			if (botMember.permissionsIn(thread.id).has(PermissionsBitField.Flags.ManageMessages)) {
				await msg.pin();
				await wait(50); // Let's wait a few ms here to ensure the latest message is actually the pin message
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
		if (config.titleType === TitleType.FirstFourtyChars) {
			return message.length > 40 ? title + "..." : title;
		}

		return clampWithElipse(title, 100);
	}
}
