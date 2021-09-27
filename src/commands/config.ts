import { codeBlock, SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { getConfig, removeInvalidConfigKeys, setConfig } from "../helpers/configHelpers";
import { ephemeralReply, getCodeFromCodeBlock } from "../helpers/messageHelpers";
import { NeedleCommand } from "../types/needleCommand";

// TODO: PERMISSIONS!

export const command: NeedleCommand = {
	name: "config",
	shortHelpDescription: "Modify or view the configuration of Needle",

	async getSlashCommandBuilder() {
		return new SlashCommandBuilder()
			.setName("config")
			.setDescription("Modify or view the configuration of Needle")
			.addSubcommand(subcommand => {
				return subcommand
					.setName("set")
					.setDescription("Set the entire configuration at once by passing raw JSON data")
					.addStringOption(option => {
						return option
							.setName("json")
							.setDescription("The raw json data for the config")
							.setRequired(true);
					});
			})
			.addSubcommand(subcommand => {
				return subcommand
					.setName("get")
					.setDescription("Get the configuration");
			})
			.toJSON();
	},

	async execute(interaction: CommandInteraction): Promise<void> {
		if (interaction.options.getSubcommand() === "set") {
			return setConfigCommand(interaction);
		}

		if (interaction.options.getSubcommand() === "get") {
			return getConfigCommand(interaction);
		}
	},
};

async function getConfigCommand(interaction: CommandInteraction): Promise<void> {
	if (!interaction.guildId || !interaction.guild) {
		return ephemeralReply(interaction, "You can only use this command from a server");
	}

	const config = getConfig(interaction.guildId);
	const configJson = JSON.stringify(config, undefined, 4);
	return ephemeralReply(interaction, `Current configuration for \`${interaction.guild.name}\`: ${codeBlock("json", configJson)}`);
}

async function setConfigCommand(interaction: CommandInteraction): Promise<void> {
	if (!interaction.guildId) {
		return ephemeralReply(interaction, "You can only use this command from a server");
	}

	let configJson = interaction.options.getString("json");
	if (!configJson) {
		return ephemeralReply(interaction, "You must provide JSON content");
	}

	configJson = getCodeFromCodeBlock(configJson);

	let parsedJson;
	try {
		parsedJson = JSON.parse(configJson);
		parsedJson = removeInvalidConfigKeys(parsedJson);
	}
	catch {
		return ephemeralReply(interaction, "Your input was not valid JSON. You can use an online tool such as <https://onlinejsontools.com/validate-json> to validate your json.\n\nThis is your input: ```json\n" + configJson + "```");
	}

	const errorMessage = "Your config was invalid. Remember to: \n- Pass minified JSON, because new lines inside commands does not work in Discord. You can use an online tool such as <https://onlinejsontools.com/minify-json> for minification.\n- Wrap the config in an object. \n- Spell property keys correctly.\n\nIf you need help with the formatting, you can see the default config of Needle at <https://github.com/MarcusOtter/discord-needle/blob/main/src/config.json>. Changes to `discordApiToken` and `dev` will be ignored by this command.\n\nYour input after sanitization: ```json\n" + JSON.stringify(parsedJson, undefined, 4) + "```";
	if (typeof parsedJson !== "object" || Object.keys(parsedJson).length === 0) {
		return ephemeralReply(interaction, errorMessage);
	}

	const success = setConfig(interaction.guildId, parsedJson);
	await ephemeralReply(interaction, success
		? "Successfully set the config. \n\n**Changed settings**: ```json\n" + JSON.stringify(parsedJson, undefined, 4) + "```"
		: errorMessage);
}
