// /*
// This file is part of Needle.

// Needle is free software: you can redistribute it and/or modify it under the terms of the GNU
// Affero General Public License as published by the Free Software Foundation, either version 3 of
// the License, or (at your option) any later version.

// Needle is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even
// the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero
// General Public License for more details.

// You should have received a copy of the GNU Affero General Public License along with Needle.
// If not, see <https://www.gnu.org/licenses/>.
// */

// import {
// 	ActionRowBuilder,
// 	type ButtonBuilder,
// 	EmbedBuilder,
// 	SlashCommandBuilder,
// 	type APIApplicationCommandOption,
// 	type ChatInputCommandInteraction,
// } from "discord.js";
// // import { getCommand, getOrLoadAllCommands } from "../handlers/commandHandler";
// import { getBugReportButton, getDiscordInviteButton, getFeatureRequestButton } from "../helpers/messageHelpers";
// import CommandLoader from "../implementations/CommandLoader";
// import type { ExecuteResult, NeedleCommand } from "../types/needleCommand";

// export const command: NeedleCommand = {
// 	name: "help",
// 	shortHelpDescription: "", // Help command has a special treatment of help description
// 	longHelpDescription:
// 		"The help command shows you a list of all available commands. If you provide a command after `/help`, it will show you more information about that specific command (exactly like you just did!).",

// 	getSlashCommandBuilder() {
// 		return getHelpSlashCommandBuilder();
// 	},

// 	async execute(interaction: ChatInputCommandInteraction): ExecuteResult {
// 		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
// 			getDiscordInviteButton(),
// 			getBugReportButton(),
// 			getFeatureRequestButton()
// 		);

// 		const commandName = interaction.options?.getString("command");
// 		if (commandName) {
// 			// User wrote for example "/help title"
// 			const commandsEmbed = await getCommandDetailsEmbed(commandName);
// 			await interaction.reply({
// 				embeds: commandsEmbed,
// 				components: [row],
// 				ephemeral: true,
// 			});
// 		} else {
// 			// User only wrote "/help"
// 			const commandsEmbed = await getAllCommandsEmbed();
// 			await interaction.reply({
// 				embeds: [commandsEmbed],
// 				components: [row],
// 				ephemeral: true,
// 			});
// 		}
// 	},
// };

// async function getCommandDetailsEmbed(commandName: string): Promise<EmbedBuilder[]> {
// 	const cmd = CommandLoader.getCommand(commandName);
// 	if (!cmd) return [];

// 	const cmdOptionString = await getCommandOptionString(cmd);
// 	const cmdOptions = await getCommandOptions(cmd);
// 	let cmdOptionExplanations = "";
// 	for (const option of cmdOptions ?? []) {
// 		cmdOptionExplanations += `\`${option.name}\` - ${option.required ? "" : "(optional)"} ${option.description}\n`;
// 	}

// 	const commandInfoEmbed = new EmbedBuilder()
// 		.setTitle(`Information about \`/${cmd.name}\``)
// 		.setDescription(cmd.longHelpDescription ?? cmd.shortHelpDescription)
// 		.addFields({ name: "Usage", value: `/${cmd.name}${cmdOptionString}`, inline: false });

// 	if (cmdOptionExplanations && cmdOptionExplanations.length > 0) {
// 		commandInfoEmbed.addFields({ name: "Options", value: cmdOptionExplanations, inline: false });
// 	}

// 	return [commandInfoEmbed];
// }

// async function getAllCommandsEmbed(): Promise<EmbedBuilder> {
// 	const embed = new EmbedBuilder().setTitle("🪡  Needle Commands"); // :sewing_needle:
// 	const commands = await getOrLoadAllCommands();
// 	for (const cmd of commands) {
// 		// Help command gets special treatment
// 		if (cmd.name === "help") {
// 			embed.addFields(
// 				{ name: "/help", value: "Shows a list of all available commands", inline: false },
// 				{
// 					name: "/help  `command`",
// 					value: "Shows more information and example usage of a specific `command`",
// 					inline: false,
// 				}
// 			);
// 			continue;
// 		}
// 		const commandOptions = await getCommandOptionString(cmd);
// 		embed.addFields({ name: `/${cmd.name}${commandOptions}`, value: cmd.shortHelpDescription, inline: false });
// 	}
// 	return embed;
// }

// async function getCommandOptionString(cmd: NeedleCOmmand): Promise<string> {
// 	const commandInfo = await cmd.getSlashCommandBuilder();
// 	if (!commandInfo.options) return "";

// 	let output = "";
// 	for (const option of commandInfo.options) {
// 		output += `  \`${option.name}${option.required ? "" : "?"}\``;
// 	}

// 	return output;
// }

// async function getCommandOptions(cmd: NeedleCommand): Promise<APIApplicationCommandOption[] | undefined> {
// 	const commandInfo = await cmd.getSlashCommandBuilder();
// 	return commandInfo.options;
// }

// async function getHelpSlashCommandBuilder() {
// 	const commands = await getOrLoadAllCommands();
// 	const builder = new SlashCommandBuilder()
// 		.setName("help")
// 		.setDescription("Shows a list of all available commands")
// 		.addStringOption(option => {
// 			option
// 				.setName("command")
// 				.setDescription(
// 					"The specific command you want help with. Exclude this option to get a list of all commands."
// 				)
// 				.setRequired(false);

// 			for (const cmd of commands) {
// 				option.addChoices({ name: cmd.name, value: cmd.name });
// 			}

// 			return option;
// 		});

// 	return builder.toJSON();
// }
