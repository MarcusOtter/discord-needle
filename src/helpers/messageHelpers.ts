// ________________________________________________________________________________________________
//
// This file is part of Needle.
//
// Needle is free software: you can redistribute it and/or modify it under the terms of the GNU
// Affero General Public License as published by the Free Software Foundation, either version 3 of
// the License, or (at your option) any later version.
//
// Needle is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even
// the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero
// General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License along with Needle.
// If not, see <https://www.gnu.org/licenses/>.
//
// ________________________________________________________________________________________________

import {
	type BaseCommandInteraction,
	type Message,
	MessageButton,
	type MessageComponentInteraction,
	type TextBasedChannel,
	type ThreadChannel,
	type User,
} from "discord.js";

import type { MessageContext } from "../types/messageContext";
import type { NeedleConfig } from "../types/needleConfig";
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

export async function getThreadAuthor(channel: ThreadChannel): Promise<User | undefined> {
	const parentMessage = await getThreadStartMessage(channel);

	if (parentMessage) return parentMessage.author;

	// https://github.com/MarcusOtter/discord-needle/issues/49
	const firstMessage = await getFirstMessageInChannel(channel);
	const author = firstMessage?.mentions.users.first();

	if (!author) console.log(`Could not determine author of thread "${channel.name}"`);
	return author;
}

export async function getFirstMessageInChannel(channel: TextBasedChannel): Promise<Message | undefined> {
	const amount = channel.isThread() ? 2 : 1; // threads have an empty message as the first message
	const messages = await channel.messages.fetch({ after: "0", limit: amount });
	return messages.first();
}

export function interactionReply(
	interaction: BaseCommandInteraction | MessageComponentInteraction,
	message?: string,
	ephemeral = true): Promise<void> {
	if (!message || message.length == 0) {
		return interaction.reply({
			content: getMessage("ERR_UNKNOWN"),
			ephemeral: true,
		});
	}

	return interaction.reply({
		content: message,
		ephemeral: ephemeral,
	});
}

export function getMessage(messageKey: MessageKey, replaceVariables = true): string | undefined {
	const config = getConfig(context?.interaction?.guildId ?? undefined);
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
		.setEmoji("930584823473516564"); // :discord_light:
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

export function getHelpButton(): MessageButton {
	return new MessageButton()
		.setCustomId("help")
		.setLabel("Commands")
		.setStyle("SECONDARY")
		.setEmoji("937931337942306877"); // :slash_commands:
}

async function getThreadStartMessage(threadChannel: TextBasedChannel | null): Promise<Message | null> {
	if (!threadChannel?.isThread()) { return null; }
	if (!threadChannel.parentId) { return null; }

	const parentChannel = await threadChannel.guild?.channels.fetch(threadChannel.parentId);
	if (!parentChannel?.isText()) { return null; }

	// The thread's channel ID is the same as the start message's ID,
	// but if the start message has been deleted this will throw an exception
	return parentChannel.messages
		.fetch(threadChannel.id)
		.catch(() => null);
}
