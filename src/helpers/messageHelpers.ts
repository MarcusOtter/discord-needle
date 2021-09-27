import { BaseCommandInteraction, Message, MessageButton, MessageComponentInteraction, TextBasedChannels } from "discord.js";

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

export function ephemeralReply(interaction: BaseCommandInteraction | MessageComponentInteraction, replyContent: string): Promise<void> {
	return interaction.reply({ content: replyContent, ephemeral: true });
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