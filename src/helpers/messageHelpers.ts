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

let currentContext: MessageContext = {};

export function addMessageContext(context: Partial<MessageContext>): void {
	currentContext = Object.assign(currentContext, context);
}

export function resetMessageContext(): void {
	currentContext = {};
}

export async function getThreadStartMessage(threadChannel: TextBasedChannels | null): Promise<Message | null> {
	if (!threadChannel?.isThread()) { return null; }
	if (!threadChannel.parentId) { return null; }

	const parentChannel = await threadChannel.guild?.channels.fetch(threadChannel.parentId);
	if (!parentChannel?.isText()) { return null; }

	// The thread's channel ID is the same as the start message's ID.
	return parentChannel.messages.fetch(threadChannel.id);
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

export function getMessage(
	messageKey: keyof NonNullable<NeedleConfig["messages"]>): string | undefined {

	const config = getConfig(currentContext?.guildId);
	if (!config.messages) { return ""; }

	const message = config.messages[messageKey];
	if (!currentContext || !message) { return message; }

	const invokerMention = currentContext.invoker ? `<@${currentContext.invoker.id}>` : "";
	const sourceChannelMention = currentContext.sourceChannel ? `<#${currentContext.sourceChannel.id}>` : "";
	const sourceMessageRelativeTimestamp = currentContext.sourceMessage
		? `<t:${Math.round(currentContext.sourceMessage.createdTimestamp / 1000)}:R>`
		: "";

	return message
		.replaceAll("$$invoker.mention", invokerMention)
		.replaceAll("$$sourceChannel.mention", sourceChannelMention)
		.replaceAll("$$sourceMessage.relativeTimestamp", sourceMessageRelativeTimestamp);
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

export function getFeatureRequestButton(buttonText = "Suggest a feature"): MessageButton {
	return new MessageButton()
		.setLabel(buttonText)
		.setStyle("LINK")
		.setURL("https://github.com/MarcusOtter/discord-needle/issues/new/choose")
		.setEmoji("💡");
}
