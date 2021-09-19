import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { getAllCommands } from "../handlers/commandHandler";
import { NeedleCommand } from "../types/needleCommand";

export const command: NeedleCommand = {
	info: new SlashCommandBuilder()
		.setName("help")
		.setDescription("Shows information about Needle"),

	async execute(interaction: CommandInteraction): Promise<void> {
		const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setLabel("Join the support server")
					.setStyle("LINK")
					.setURL("https://discord.gg/8BmnndXHp6")
					.setEmoji("888980792271859732"),
				new MessageButton()
					.setLabel("Report a bug")
					.setStyle("LINK")
					.setURL("https://github.com/MarcusOtter/discord-needle/issues/new")
					.setEmoji("🐛"),
				new MessageButton()
					.setLabel("Suggest a feature")
					.setStyle("LINK")
					.setURL("https://github.com/MarcusOtter/discord-needle/issues/new")
					.setEmoji("💡"),
				new MessageButton()
					.setLabel("Source code")
					.setStyle("LINK")
					.setURL("https://github.com/MarcusOtter/discord-needle/")
					.setEmoji("888980150077755412"));

		const commandsEmbed = await getCommandsEmbed();
		await interaction.reply({
			content: "This is a cool bot made by cool people.\nThis is a new line.",
			embeds: [commandsEmbed],
			components: [row],
			ephemeral: true,
		});
	},
};

async function getCommandsEmbed(): Promise<MessageEmbed> {
	const embed = new MessageEmbed()
		.setTitle("Needle Commands")
		.setDescription("Write `/help [command]` to get more info about a specific command!");

	const commands = await getAllCommands();
	for (const cmd of commands) {
		embed.addField(`/${cmd.info.name}`, cmd.info.description, false);
	}

	return embed;
}
