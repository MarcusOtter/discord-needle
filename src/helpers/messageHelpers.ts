import { BaseCommandInteraction, Message, TextBasedChannels } from "discord.js";

export async function getThreadStartMessage(threadChannel: TextBasedChannels | null): Promise<Message | null> {
	if (!threadChannel?.isThread()) { return null; }
	if (!threadChannel.parentId) { return null; }

	const parentChannel = await threadChannel.guild?.channels.fetch(threadChannel.parentId);
	if (!parentChannel?.isText()) { return null; }

	// The thread's channel ID is the same as the start message's ID.
	return parentChannel.messages.fetch(threadChannel.id);
}

export function ephemeralReply(interaction: BaseCommandInteraction, replyContent: string): Promise<void> {
	return interaction.reply({ content: replyContent, ephemeral: true });
}
