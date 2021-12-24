import {
	BaseCommandInteraction,
	Message,
	MessageButton,
	MessageComponentInteraction,
	TextBasedChannels,
} from "discord.js";

import { MessageContext } from "../types/messageContext";
import { NeedleConfig } from "../types/needleConfig";
import { getConfig } from "./configHelpers";

let context: MessageContext = {};

export type MessageKey = keyof NonNullable<NeedleConfig["messages"]>;

export function addMessageContext(additionalContext: Partial<MessageContext>): void {
	context = Object.assign(context, additionalContext);
}

export function resetMessageContext(): void {
	context = {};
}

export function isAutoThreadChannel(channelId: string, guildId: string): boolean {
	const config = getConfig(guildId);
	return config?.threadChannels?.some(x => x?.channelId === channelId) ?? false;
}

export async function getThreadStartMessage(threadChannel: TextBasedChannels | null): Promise<Message | null> {
	if (!threadChannel?.isThread()) { return null; }
	if (!threadChannel.parentId) { return null; }

	const parentChannel = await threadChannel.guild?.channels.fetch(threadChannel.parentId);
	if (!parentChannel?.isText()) { return null; }

	// The thread's channel ID is the same as the start message's ID,
	// but if the start message has been deleted this will throw an exception
	return parentChannel.messages
		.fetch(threadChannel.id)
		.catch(() => {
			console.error(`Start message is missing in thread "${threadChannel.name}"`);
			return null;
		});
}

export function getCodeFromCodeBlock(codeBlock: string): string {
	const codeBlockStart = codeBlock.match(/^```(\w*)/ig);

	// If it has no code block
	if (codeBlockStart?.length === 0) {
		return codeBlock;
	}

	// Replace start and end tags
	const codeWithoutTags = codeBlock.replaceAll(/^```(\w*)/ig, "").replaceAll(/```$/ig, "");
	return codeWithoutTags.trim();
}

export function interactionReply(
	interaction: BaseCommandInteraction | MessageComponentInteraction,
	message?: string,
	ephemeral = true): Promise<void> {
	if (!message || message.length == 0) { return Promise.resolve(); }
	return interaction.reply({
		content: message,
		ephemeral: ephemeral,
	});
}

export function getMessage(messageKey: MessageKey, replaceVariables = true): string | undefined {
	const config = getConfig(context?.interaction?.guildId);
	if (!config.messages) { return ""; }

	const message = config.messages[messageKey];
	if (!context || !message) { return message; }

	const user = context.user ? `<@${context.user.id}>` : "";
	const channel = context.channel ? `<#${context.channel.id}>` : "";
	const timeAgo = context.timeAgo || (context.message
		? `<t:${Math.round(context.message.createdTimestamp / 1000)}:R>`
		: "");

	return !replaceVariables
		? message
		: message
			.replaceAll("$USER", user)
			.replaceAll("$CHANNEL", channel)
			.replaceAll("$TIME_AGO", timeAgo);
}

export function getDiscordInviteButton(buttonText = "Join the support server"): MessageButton {
	return new MessageButton()
		.setLabel(buttonText)
		.setStyle("LINK")
		.setURL("https://discord.gg/8BmnndXHp6")
		.setEmoji("888980792271859732"); // :discord_light:
}

export function getGithubRepoButton(buttonText = "Source code"): MessageButton {
	return new MessageButton()
		.setLabel(buttonText)
		.setStyle("LINK")
		.setURL("https://github.com/MarcusOtter/discord-needle/")
		.setEmoji("888980150077755412"); // :github_light:
}

export function getBugReportButton(buttonText = "Report a bug"): MessageButton {
	return new MessageButton()
		.setLabel(buttonText)
		.setStyle("LINK")
		.setURL("https://github.com/MarcusOtter/discord-needle/issues/new/choose")
		.setEmoji("🐛");
}

export function getFeatureRequestButton(buttonText = "Suggest an improvement"): MessageButton {
	return new MessageButton()
		.setLabel(buttonText)
		.setStyle("LINK")
		.setURL("https://github.com/MarcusOtter/discord-needle/issues/new/choose")
		.setEmoji("💡");
}

export function getCloseConfigChannelButton(): MessageButton {
	return new MessageButton()
		.setCustomId("close-config-channel")
		.setLabel("Close channel")
		.setStyle("DANGER");
}
