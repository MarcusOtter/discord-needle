import { SlashCommandBuilder } from "@discordjs/builders";
import { ChannelType } from "discord-api-types";
import { CommandInteraction, GuildMember } from "discord.js";
import { disableAutothreading, enableAutothreading, getConfig, setMessage } from "../helpers/configHelpers";
import { interactionReply, getMessage, MessageKey, isAutoThreadChannel } from "../helpers/messageHelpers";
import { NeedleCommand } from "../types/needleCommand";
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

		return interactionReply(interaction, getMessage("ERR_UNKNOWN"));
	},
};

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

function configureAutothreading(interaction: CommandInteraction): Promise<void> {
	const channel = interaction.options.getChannel("channel");
	const enabled = interaction.options.getBoolean("enabled");
	const customMessage = interaction.options.getString("custom-message") ?? "";

	if (!interaction.guild) {
		return interactionReply(interaction, getMessage("ERR_ONLY_IN_SERVER"));
	}

	if (!channel || enabled == null) {
		return interactionReply(interaction, getMessage("ERR_PARAMETER_MISSING"));
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
