import { SlashCommandBuilder } from "@discordjs/builders";
import { ChannelType } from "discord-api-types";
import { type CommandInteraction, GuildMember, type GuildTextBasedChannel, Permissions } from "discord.js";
import { disableAutothreading, enableAutothreading, getConfig, resetConfigToDefault, setArchiveImmediately, setMessage } from "../helpers/configHelpers";
import { interactionReply, getMessage, MessageKey, isAutoThreadChannel, addMessageContext } from "../helpers/messageHelpers";
import type { NeedleCommand } from "../types/needleCommand";
import { memberIsModerator } from "../helpers/permissionHelpers";

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
					.setName("default")
					.setDescription("Reset the server's custom Needle configuration to the default");
			})
			.addSubcommand(subcommand => {
				return subcommand
					.setName("archive-immediately")
					.setDescription("Configure whether threads are archived immediately when users close them or if it should take 1 hour")
					.addBooleanOption(option => {
						return option
							.setName("value")
							.setDescription("Whether or not threads should be archived immediately when users close a thread");
					});
			})
			.addSubcommand(subcommand => {
				return subcommand
					.setName("autothreading")
					.setDescription("Enable or disable automatic creation of threads on every new message in a channel")
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
			.toJSON();
	},

	async execute(interaction: CommandInteraction): Promise<void> {
		if (!interaction.guildId || !interaction.guild) {
			return interactionReply(interaction, getMessage("ERR_ONLY_IN_SERVER"));
		}

		if (!memberIsModerator(interaction.member as GuildMember)) {
			return interactionReply(interaction, getMessage("ERR_INSUFFICIENT_PERMS"));
		}

		if (interaction.options.getSubcommand() === "default") {
			const success = resetConfigToDefault(interaction.guild.id);
			return interactionReply(interaction, success
				? "Successfully reset the Needle configuration to the default."
				: getMessage("ERR_NO_EFFECT"), !success);
		}

		if (interaction.options.getSubcommand() === "archive-immediately") {
			return archiveImmediately(interaction);
		}

		if (interaction.options.getSubcommand() === "message") {
			return configureMessage(interaction);
		}

		if (interaction.options.getSubcommand() === "autothreading") {
			return configureAutothreading(interaction);
		}

		return interactionReply(interaction, getMessage("ERR_UNKNOWN"));
	},
};

async function archiveImmediately(interaction: CommandInteraction) {
	const isImmediate = interaction.options.getBoolean("value");
	if (isImmediate === null) return interactionReply(interaction, getMessage("ERR_UNKNOWN"));

	const config = getConfig(interaction.guildId ?? undefined);
	if (isImmediate == config.archiveImmediately) return interactionReply(interaction, getMessage("ERR_NO_EFFECT"));

	const result = setArchiveImmediately(interaction.guild, isImmediate);
	return result
		? interactionReply(interaction, isImmediate ? "Threads will now archive immediately when closed by users." : "Threads will now archive after 1 hour of inactivity when closed by users.", false)
		: interactionReply(interaction, getMessage("ERR_UNKNOWN"));
}

function configureMessage(interaction: CommandInteraction): Promise<void> {
	const key = interaction.options.getString("key") as MessageKey;
	const value = interaction.options.getString("value");

	if (!interaction.guild) {
		return interactionReply(interaction, getMessage("ERR_ONLY_IN_SERVER"));
	}

	if (!value || value.length === 0) {
		return interactionReply(interaction, `**${key}** message:\n\n>>> ${getMessage(key, false)}`);
	}

	const oldValue = getMessage(key, false);
	return setMessage(interaction.guild, key, value)
		? interactionReply(interaction, `Changed **${key}**\n\nOld message:\n> ${oldValue?.replaceAll("\n", "\n> ")}\n\nNew message:\n>>> ${value}`, false)
		: interactionReply(interaction, getMessage("ERR_UNKNOWN"));
}

async function configureAutothreading(interaction: CommandInteraction): Promise<void> {
	const channel = interaction.options.getChannel("channel") as GuildTextBasedChannel;
	const enabled = interaction.options.getBoolean("enabled");
	const customMessage = interaction.options.getString("custom-message") ?? "";

	if (!interaction.guild || !interaction.guildId) {
		return interactionReply(interaction, getMessage("ERR_ONLY_IN_SERVER"));
	}

	if (!channel || enabled == null) {
		return interactionReply(interaction, getMessage("ERR_PARAMETER_MISSING"));
	}

	const clientUser = interaction.client.user;
	if (!clientUser) return interactionReply(interaction, getMessage("ERR_UNKNOWN"));

	const botMember = await interaction.guild.members.fetch(clientUser);
	if (!botMember.permissionsIn(channel.id).has(Permissions.FLAGS.VIEW_CHANNEL)) {
		addMessageContext({ channel: channel });
		return interactionReply(interaction, getMessage("ERR_CHANNEL_VISIBILITY"));
	}

	if (enabled) {
		const success = enableAutothreading(interaction.guild, channel.id, customMessage);
		return success
			? interactionReply(interaction, `Updated auto-threading settings for <#${channel.id}>`, false)
			: interactionReply(interaction, getMessage("ERR_UNKNOWN"));
	}

	if (!isAutoThreadChannel(channel.id, interaction.guildId)) {
		return interactionReply(interaction, getMessage("ERR_NO_EFFECT"));
	}

	const success = disableAutothreading(interaction.guild, channel.id);
	return success
		? interactionReply(interaction, `Removed auto-threading in <#${channel.id}>`, false)
		: interactionReply(interaction, getMessage("ERR_UNKNOWN"));
}
