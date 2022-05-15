/*
This file is part of Needle.

Needle is free software: you can redistribute it and/or modify it under the terms of the GNU
Affero General Public License as published by the Free Software Foundation, either version 3 of
the License, or (at your option) any later version.

Needle is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even
the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero
General Public License for more details.

You should have received a copy of the GNU Affero General Public License along with Needle.
If not, see <https://www.gnu.org/licenses/>.
*/

import { SlashCommandBuilder } from "@discordjs/builders";
import { ChannelType } from "discord-api-types/v9";
import { type CommandInteraction, type GuildMember, type GuildTextBasedChannel, Permissions } from "discord.js";
import {
	disableAutothreading,
	emojisEnabled,
	enableAutothreading,
	getConfig,
	resetConfigToDefault,
	setEmojisEnabled,
	setMessage,
} from "../helpers/configHelpers";
import {
	interactionReply,
	getMessage,
	MessageKey,
	isAutoThreadChannel,
	addMessageContext,
} from "../helpers/messageHelpers";
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
					.setDescription(
						"Modify the content of a message that Needle replies with when a certain action happens"
					)
					.addStringOption(option => {
						const opt = option.setName("key").setDescription("The key of the message").setRequired(true);

						for (const messageKey of Object.keys(getConfig().messages ?? [])) {
							opt.addChoice(messageKey, messageKey);
						}

						return opt;
					})
					.addStringOption(option => {
						return option
							.setName("value")
							.setDescription(
								"The new message for the selected key (shows the current value of this message key if left blank)"
							)
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
					.setName("auto-threading")
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
							.setDescription(
								"Whether or not threads should be automatically created from new messages in the selected channel"
							)
							.setRequired(true);
					})
					.addBooleanOption(option => {
						return option
							.setName("include-bots")
							.setDescription(
								"Whether or not threads should be created on messages by bots. Default: False"
							);
					})
					.addStringOption(option => {
						return option
							.setName("archive-behavior")
							.setDescription("What should happen when users close a thread?")
							.addChoice("✅ Archive immediately (DEFAULT)", "immediately")
							.addChoice("⌛ Archive after 1 hour of inactivity", "slow");
					})
					.addStringOption(option => {
						return option
							.setName("slowmode")
							.setDescription("The default slowmode option for new threads")
							.addChoice("Off (DEFAULT)", "0")
							.addChoice("30 seconds", "30")
							.addChoice("1 minute", "60")
							.addChoice("5 minutes", "300")
							.addChoice("15 minutes", "900")
							.addChoice("1 hour", "3600")
							.addChoice("6 hours", "21600");
					})
					.addStringOption(option => {
						return option
							.setName("custom-message")
							.setDescription('The message to send when a thread is created ("\\n" for new line)');
					});
			})
			.addSubcommand(subcommand => {
				return subcommand
					.setName("emojis")
					.setDescription("Toggle thread name emojis on or off")
					.addBooleanOption(option => {
						return option
							.setName("enabled")
							.setDescription("Whether or not emojis should be enabled for titles in auto-threads");
					});
			})
			.toJSON();
	},

	async execute(interaction: CommandInteraction): Promise<void> {
		if (!interaction.guildId || !interaction.guild) {
			return interactionReply(interaction, getMessage("ERR_ONLY_IN_SERVER", interaction.id));
		}

		if (!memberIsModerator(interaction.member as GuildMember)) {
			return interactionReply(interaction, getMessage("ERR_INSUFFICIENT_PERMS", interaction.id));
		}

		if (interaction.options.getSubcommand() === "default") {
			const success = resetConfigToDefault(interaction.guild.id);
			const message = success
				? "Successfully reset the Needle configuration to the default."
				: getMessage("ERR_NO_EFFECT", interaction.id);

			return interactionReply(interaction, message, !success);
		}

		if (interaction.options.getSubcommand() === "emojis") return configureEmojis(interaction);
		if (interaction.options.getSubcommand() === "message") return configureMessage(interaction);
		if (interaction.options.getSubcommand() === "auto-threading") return configureAutothreading(interaction);

		return interactionReply(interaction, getMessage("ERR_UNKNOWN", interaction.id));
	},
};

function configureEmojis(interaction: CommandInteraction): Promise<void> {
	const enable = interaction.options.getBoolean("enabled");
	if (enable === null || interaction.guild === null) {
		return interactionReply(interaction, getMessage("ERR_PARAMETER_MISSING", interaction.id));
	}

	if (enable === emojisEnabled(interaction.guild)) {
		return interactionReply(interaction, getMessage("ERR_NO_EFFECT", interaction.id));
	}

	const success = setEmojisEnabled(interaction.guild, enable);
	if (!success) {
		return interactionReply(interaction, getMessage("ERR_UNKNOWN", interaction.id));
	}

	return interactionReply(interaction, `Successfully ${enable ? "enabled" : "disabled"} emojis.`);
}

function configureMessage(interaction: CommandInteraction): Promise<void> {
	const key = interaction.options.getString("key") as MessageKey;
	const value = interaction.options.getString("value");

	if (!interaction.guild) {
		return interactionReply(interaction, getMessage("ERR_ONLY_IN_SERVER", interaction.id));
	}

	if (!value || value.length === 0) {
		return interactionReply(interaction, `**${key}** message:\n\n>>> ${getMessage(key, interaction.id, false)}`);
	}

	const oldValue = getMessage(key, interaction.id, false);
	return setMessage(interaction.guild, key, value)
		? interactionReply(
				interaction,
				`Changed **${key}**\n\nOld message:\n> ${oldValue?.replaceAll(
					"\n",
					"\n> "
				)}\n\nNew message:\n>>> ${value}`,
				false
		  )
		: interactionReply(interaction, getMessage("ERR_UNKNOWN", interaction.id));
}

async function configureAutothreading(interaction: CommandInteraction): Promise<void> {
	const channel = interaction.options.getChannel("channel") as GuildTextBasedChannel;
	const enabled = interaction.options.getBoolean("enabled");
	const customMessage = interaction.options.getString("custom-message") ?? "";
	const archiveImmediately = interaction.options.getString("archive-behavior") !== "slow";
	const includeBots = interaction.options.getBoolean("include-bots") ?? false;
	const slowmode = parseInt(interaction.options.getString("slowmode") ?? "0");

	if (!interaction.guild || !interaction.guildId) {
		return interactionReply(interaction, getMessage("ERR_ONLY_IN_SERVER", interaction.id));
	}

	if (!channel || enabled === null) {
		return interactionReply(interaction, getMessage("ERR_PARAMETER_MISSING", interaction.id));
	}

	const clientUser = interaction.client.user;
	if (!clientUser) {
		return interactionReply(interaction, getMessage("ERR_UNKNOWN", interaction.id));
	}

	const botMember = await interaction.guild.members.fetch(clientUser);
	const botPermissions = botMember.permissionsIn(channel.id);

	if (!botPermissions.has(Permissions.FLAGS.VIEW_CHANNEL)) {
		addMessageContext(interaction.id, { channel });
		return interactionReply(interaction, getMessage("ERR_CHANNEL_VISIBILITY", interaction.id));
	}

	if (slowmode && slowmode > 0 && !botPermissions.has(Permissions.FLAGS.MANAGE_THREADS)) {
		addMessageContext(interaction.id, { channel });
		return interactionReply(interaction, getMessage("ERR_CHANNEL_SLOWMODE", interaction.id));
	}

	if (enabled) {
		const success = enableAutothreading(
			interaction.guild,
			channel.id,
			includeBots,
			archiveImmediately,
			customMessage,
			slowmode
		);
		return success
			? interactionReply(interaction, `Updated auto-threading settings for <#${channel.id}>`, false)
			: interactionReply(interaction, getMessage("ERR_UNKNOWN", interaction.id));
	}

	if (!isAutoThreadChannel(channel.id, interaction.guildId)) {
		return interactionReply(interaction, getMessage("ERR_NO_EFFECT", interaction.id));
	}

	const success = disableAutothreading(interaction.guild, channel.id);
	return success
		? interactionReply(interaction, `Removed auto-threading in <#${channel.id}>`, false)
		: interactionReply(interaction, getMessage("ERR_UNKNOWN", interaction.id));
}
