import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageActionRow, MessageEmbed } from "discord.js";
import { getOrLoadAllCommands } from "../handlers/commandHandler";
import { getBugReportButton, getDiscordInviteButton, getFeatureRequestButton } from "../helpers/messageHelpers";
import { NeedleCommand } from "../types/needleCommand";

export const command: NeedleCommand = {
	name: "help",
	shortHelpDescription: "", // Help command has a special treatment of help description

	getSlashCommandBuilder() {
		return getHelpSlashCommandBuilder();
	},

	async execute(interaction: CommandInteraction): Promise<void> {
		const row = new MessageActionRow()
			.addComponents(
				getDiscordInviteButton(),
				getBugReportButton(),
				getFeatureRequestButton());

		const commandsEmbed = await getCommandsEmbed();
		await interaction.reply({
			embeds: [commandsEmbed],
			components: [row],
			ephemeral: true,
		});
	},
};

async function getCommandsEmbed(): Promise<MessageEmbed> {
	const embed = new MessageEmbed().setTitle("🪡  Needle Commands"); // :sewing_needle:
	const commands = await getOrLoadAllCommands();
	for (const cmd of commands) {
		// Help command gets special treatment
		if (cmd.name === "help") {
			embed.addField("/help", "Shows a list of all available commands", false);
			embed.addField("/help  `command-name`", "Shows more information and example usage of a specific command", false);
			continue;
		}
		const commandOptions = await getCommandOptions(cmd);
		embed.addField(`/${cmd.name}${commandOptions}`, cmd.shortHelpDescription, false);
	}
	return embed;
}

async function getCommandOptions(cmd: NeedleCommand): Promise<string> {
	const commandInfo = await cmd.getSlashCommandBuilder();
	let output = "";
	for (const option of commandInfo.options) {
		output += `  \`${option.name}${option.required ? "" : "?"}\``;
	}
	return output;
}

async function getHelpSlashCommandBuilder() {
	const commands = await getOrLoadAllCommands();
	const builder = new SlashCommandBuilder()
		.setName("help")
		.setDescription("Shows a list of all available commands")
		.addStringOption(option => {
			option
				.setName("command-name")
				.setDescription("The name of the command you want help with. Exclude this option to get a list of all commands.")
				.setRequired(false);

			for (const cmd of commands) {
				option.addChoice(cmd.name, cmd.name);
			}

			return option;
		});

	return builder.toJSON();
}
