import { SlashCommandBuilder } from "@discordjs/builders";
import { ChannelType } from "discord-api-types";
import { CommandInteraction } from "discord.js";
import { getConfig, setAutoArchiveDuration } from "../helpers/configHelpers";
import { interactionReply, getMessage } from "../helpers/messageHelpers";
import { NeedleCommand } from "../types/needleCommand";

// TODO: PERMISSIONS!

export const command: NeedleCommand = {
	name: "configure",
	shortHelpDescription: "Modify the configuration of Needle",

	async getSlashCommandBuilder() {
		return new SlashCommandBuilder()
			.setName("configure")
			.setDescription("Modify the configuration of Needle")
			.addSubcommand(subcommand => {
				return subcommand
					.setName("duration")
					.setDescription("Change the default value of Discord's auto-archive duration on threads created by Needle")
					.addStringOption(option => {
						return option
							.setName("duration")
							.setDescription("The new duration")
							.setRequired(true)
							.addChoice("MAX", "MAX")
							.addChoice("1 hour", "60")
							.addChoice("1 day", "1440")
							.addChoice("3 days", "4320")
							.addChoice("1 week", "10080");
					});
			})
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

		if (interaction.options.getSubcommand() === "duration") {
			return configureDuration(interaction);
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

function configureDuration(interaction: CommandInteraction): Promise<void> {
	const success = setAutoArchiveDuration(interaction.guildId, interaction.options.getString("duration"));
	return success
		? interactionReply(interaction, "Yay we updated")
		: interactionReply(interaction, "No shot");
}

function configureMessage(interaction: CommandInteraction): Promise<void> {
	return Promise.resolve();
}

function configureAutothreading(interaction: CommandInteraction): Promise<void> {
	return Promise.resolve();
}
