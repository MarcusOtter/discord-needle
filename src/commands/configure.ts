import { SlashCommandBuilder } from "@discordjs/builders";
import { ChannelType } from "discord-api-types";
import { CommandInteraction, GuildMember, MessageActionRow, MessageAttachment, Permissions } from "discord.js";
import { configChannelName, disableAutothreading, enableAutothreading, getConfig, setMessage } from "../helpers/configHelpers";
import { interactionReply, getMessage, MessageKey, getCloseConfigChannelButton, isAutoThreadChannel } from "../helpers/messageHelpers";
import { NeedleCommand } from "../types/needleCommand";
import { Readable } from "stream";
import { memberIsAdmin, memberIsModerator } from "../helpers/permissionHelpers";
import { createJsonMessageAttachment } from "../helpers/fileHelpers";

// Note:
// The important messages of these commands should not be configurable
// (prevents user made soft-locks where it's hard to figure out how to fix it)

export const command: NeedleCommand = {
	name: "configure",
	shortHelpDescription: "Modify the configuration of Needle",

	async getSlashCommandBuilder() {
		return new SlashCommandBuilder()
			.setName("configure")
			.setDescription("Modify the configuration of Needle")
			.addSubcommand(subcommand => {
				return subcommand
					.setName("message")
					.setDescription("Modify the content of a message that Needle replies with when a certain action happens")
					.addStringOption(option => {
						const opt = option
							.setName("key")
							.setDescription("The key of the message")
							.setRequired(true);

						for(const messageKey of Object.keys(getConfig().messages ?? [])) {
							opt.addChoice(messageKey, messageKey);
						}

						return opt;
					})
					.addStringOption(option => {
						return option
							.setName("value")
							.setDescription("The new message for the selected key (shows the current value of this message key if left blank)")
							.setRequired(false);
					});
			})
			.addSubcommand(subcommand => {
				return subcommand
					.setName("autothreading")
					.setDescription("Enable or disable automatic creation of threads when new messages are sent in a given channel")
					.addChannelOption(option => {
						return option
							.setName("channel")
							.setDescription("The channel to enable/disable automatic threading in")
							.addChannelType(ChannelType.GuildText)
							.addChannelType(ChannelType.GuildNews)
							.setRequired(true);
					})
					.addBooleanOption(option => {
						return option
							.setName("enabled")
							.setDescription("Whether or not threads should be automatically created from new messages in the selected channel")
							.setRequired(true);
					})
					.addStringOption(option => {
						return option
							.setName("custom-message")
							.setDescription("The message to send when a thread is created (uses the message SUCCESS_THREAD_CREATE if left blank)")
							.setRequired(false);
					});
			})
			.addSubcommand(subcommand => {
				return subcommand
					.setName("manually")
					.setDescription("Store and modify the raw JSON configuration for Needle. This command is for advanced users.");
			})
			.toJSON();
	},

	async execute(interaction: CommandInteraction): Promise<void> {
		if (!interaction.guildId || !interaction.guild) {
			return interactionReply(interaction, getMessage("ERR_ONLY_IN_SERVER"));
		}

		if (!memberIsModerator(interaction.member as GuildMember)) {
			return interactionReply(interaction, getMessage("ERR_INSUFFICIENT_PERMS"));
		}

		if (interaction.options.getSubcommand() === "message") {
			return configureMessage(interaction);
		}

		if (interaction.options.getSubcommand() === "autothreading") {
			return configureAutothreading(interaction);
		}

		if (!memberIsAdmin(interaction.member as GuildMember)) {
			return interactionReply(interaction, getMessage("ERR_INSUFFICIENT_PERMS"));
		}

		if (interaction.options.getSubcommand() === "manually") {
			return configureManually(interaction);
		}

		return interactionReply(interaction, getMessage("ERR_UNKNOWN"));
	},
};

function configureMessage(interaction: CommandInteraction): Promise<void> {
	const key = interaction.options.getString("key") as MessageKey;
	const value = interaction.options.getString("value");

	if (!value || value.length === 0) {
		return interactionReply(interaction, `**${key}** message:\n\n>>> ${getMessage(key, false)}`);
	}
	else {
		const oldValue = getMessage(key, false);
		return setMessage(interaction.guildId, key, value)
			? interactionReply(interaction, `Changed **${key}**\n\nOld message:\n> ${oldValue?.replaceAll("\n", "\n> ")}\n\nNew message:\n>>> ${value}`, false)
			: interactionReply(interaction, getMessage("ERR_UNKNOWN"));
	}
}

function configureAutothreading(interaction: CommandInteraction): Promise<void> {
	const channel = interaction.options.getChannel("channel");
	const enabled = interaction.options.getBoolean("enabled");
	const customMessage = interaction.options.getString("custom-message") ?? "";

	if (!channel || enabled == null) {
		return interactionReply(interaction, getMessage("ERR_PARAMETER_MISSING"));
	}

	if (enabled) {
		const success = enableAutothreading(interaction.guildId, channel.id, customMessage);
		return success
			? interactionReply(interaction, `Updated auto-threading settings for <#${channel.id}>`, false)
			: interactionReply(interaction, getMessage("ERR_UNKNOWN"));
	}
	else {
		if (!isAutoThreadChannel(channel.id, interaction.guildId)) {
			return interactionReply(interaction, getMessage("ERR_NO_EFFECT"));
		}
		const success = disableAutothreading(interaction.guildId, channel.id);
		return success
			? interactionReply(interaction, `Removed auto-threading in <#${channel.id}>`, false)
			: interactionReply(interaction, getMessage("ERR_UNKNOWN"));
	}
}

async function configureManually(interaction: CommandInteraction): Promise<void> {
	const guild = interaction.guild;
	const user = interaction.user;
	const clientUser = interaction.client.user;

	if (!guild || !user || !clientUser) {
		return interactionReply(interaction, getMessage("ERR_UNKNOWN"));
	}

	const defaultConfig = getConfig();
	const guildConfig = getConfig(guild.id);

	let configChannel = guild.channels.cache.find(x => x.name === configChannelName);
	if (configChannel) {
		return interactionReply(interaction, `Configuration channel already exists: <#${configChannel.id}>`);
	}

	configChannel = await guild.channels.create(configChannelName, {
		position: 0,
		permissionOverwrites: [
			{
				id: guild.roles.everyone.id,
				deny: [Permissions.FLAGS.VIEW_CHANNEL],
			},
			{
				id: user.id,
				allow: [Permissions.FLAGS.VIEW_CHANNEL],
			},
		],
	});

	if (!configChannel.isText()) {
		return interactionReply(interaction, getMessage("ERR_UNKNOWN"));
	}

	// Improvement: Would be nice to have a button to "reset config to default"
	// Need a button to return to automatic configuration (file system I guess)

	const msg = await configChannel.send({
		components: [
			new MessageActionRow().addComponents(
				getCloseConfigChannelButton()),
		],
		content: `
Welcome to the **Manual configuration channel** for <@${clientUser.id}> :gear:

This is where the configuration is currently hosted, so **DELETING THIS CHANNEL WILL RESET THE CONFIGURATION FOR THIS SERVER** :warning: If you want the configuration to be hosted automatically again, use the __CLOSE CHANNEL__ button below (your configuration will remain the same).

This channel does not change how the \`/configure\` commands work: they can be used as usual. However, you are also able to view and change the raw configuration manually in this channel. This enables exporting/importing the configuration between servers, for example.

:bulb: **How it works**:
• When a change is made with the \`/configure\` command, <@${clientUser.id}> will post a message with the updated configuration in this channel.
• To read this server's configuration, <@${clientUser.id}> will fetch the latest message in this channel that has valid JSON data attached.
• To change the current configuration manually, send a new message with valid configuration JSON data as an attached \`.json\` file to the message.

*Channel created by <@${user.id}> <t:${Math.round(interaction.createdTimestamp / 1000)}>*
`,
	});
	await msg.pin();

	await configChannel.send({
		content: "Global default config:",
		files: [createJsonMessageAttachment(defaultConfig, "config.json")],
	});

	const serverHasCustomConfig = JSON.stringify(defaultConfig) !== JSON.stringify(guildConfig);
	if (serverHasCustomConfig) {
		await configChannel.send({
			content: `Config for \`${guild.name}\`:`,
			files: [createJsonMessageAttachment(guildConfig, "config.json")],
		});
	}

	// TODO: Add cool versioning so like what user changed it and how (if not manual message)
	// Optionally append a link to the needle config channel whenever config is changed

	return interactionReply(interaction, `Configuration channel created: <#${configChannel.id}>`);
}
