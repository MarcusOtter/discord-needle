import { SlashCommandBuilder } from "@discordjs/builders";
import { ChannelType } from "discord-api-types";
import { CommandInteraction } from "discord.js";
import { getConfig, setMessage } from "../helpers/configHelpers";
import { interactionReply, getMessage, MessageKey } from "../helpers/messageHelpers";
import { NeedleCommand } from "../types/needleCommand";

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

		// TODO: Moderator permissions

		if (interaction.options.getSubcommand() === "message") {
			return configureMessage(interaction);
		}

		if (interaction.options.getSubcommand() === "autothreading") {
			return configureAutothreading(interaction);
		}

		// TODO: Admin permissions

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
		return interactionReply(interaction, "`" + key + "`\n>>> " + getMessage(key));
	}
	else {
		const oldValue = getMessage(key);
		setMessage(interaction.guildId, key, value);
		return interactionReply(interaction, "Changed " + key + " from " + oldValue + " to " + value);
	}
}

function configureAutothreading(interaction: CommandInteraction): Promise<void> {
	return Promise.resolve();
}

function configureManually(interaction: CommandInteraction): Promise<void> {
	return Promise.resolve();
}
