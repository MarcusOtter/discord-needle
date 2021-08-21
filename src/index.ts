import { Client, Intents, MessageEmbed } from "discord.js";
import { discordApiToken, threadChannels } from "./config.json";

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.once("ready", () => {
	console.log("Ready!");
});

client.on("messageCreate", async message => {
	const author = message.author;
	const channel = message.channel;

	if (author.bot) return;
	if (!(channel.isText())) return;
	if (!threadChannels.includes(channel.id)) return;

	const creationDate = message.createdAt.toISOString().slice(0, 10);
	const thread = await message.startThread({
		name: `${author.username} (${creationDate})`,
		autoArchiveDuration: 1440,
	});

	const embed = new MessageEmbed()
		.setAuthor(author.username, author.displayAvatarURL())
		.setDescription(message.content)
		.setColor([255, 94, 0]);

	const channelMention = `<#${channel.id}>`;
	const relativeTimestamp = `<t:${Math.round(message.createdTimestamp / 1000)}:R>`;

	const threadMsg = await thread.send({
		embeds: [embed],
		content: `Thread created from ${channelMention} by <@${author.id}> ${relativeTimestamp} with the following message:`,
	});

	await threadMsg.pin();
	await thread.leave();
});

client.login(discordApiToken);
