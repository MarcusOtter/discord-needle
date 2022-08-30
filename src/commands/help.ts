import { EmbedBuilder, GuildMember, GuildTextBasedChannel, SlashCommandBuilder } from "discord.js";
import { Nullish, SlashCommandBuilderWithOptions } from "../helpers/typeHelpers.js";
import CommandCategory from "../models/enums/CommandCategory.js";
import InteractionContext from "../models/InteractionContext.js";
import NeedleCommand from "../models/NeedleCommand.js";

export default class HelpCommand extends NeedleCommand {
	public readonly name = "help";
	public readonly description = "See Needle's commands";
	public readonly category = CommandCategory.Info;

	public addOptions(builder: SlashCommandBuilder): SlashCommandBuilderWithOptions {
		return builder.addStringOption(option =>
			option
				.setName("filter")
				.setDescription("Which commands do you want to see?")
				.addChoices(
					{ name: "Available to you in current channel (ᴅᴇꜰᴀᴜʟᴛ)", value: "default" },
					{ name: "All Needle commands", value: "all" }
				)
		);
	}

	public async execute(context: InteractionContext): Promise<void> {
		const isInGuild = context.isInGuild();
		const member = isInGuild ? context.interaction.member : null;
		const channel = isInGuild ? context.interaction.channel : null;
		const showAll = context.isSlashCommand() && context.interaction.options.getString("filter") === "all";

		const commandsEmbed = await this.getCommandsEmbed(member, channel, showAll);

		await context.interaction.reply({
			content: "Need more help with Needle? Join us in the [support server](https://discord.gg/8BmnndXHp6)!",
			embeds: [commandsEmbed],
			ephemeral: true,
		});
	}

	private async getCommandsEmbed(
		member: Nullish<GuildMember>,
		channel: Nullish<GuildTextBasedChannel>,
		showAll: boolean
	): Promise<EmbedBuilder> {
		const commands = await this.bot.getAllCommands();

		const fields = [];
		let seeingAllCommands = true;
		for (const category of Object.values(CommandCategory)) {
			const commandsInCategory = commands.filter(cmd => cmd.category === category);
			const descriptions = await this.getCommandDescriptions(commandsInCategory, member, channel, showAll);

			if (commandsInCategory.length !== descriptions.length) {
				seeingAllCommands = false;
			}

			if (descriptions.length > 0) {
				fields.push({ name: category, value: descriptions.join("\n") });
			}
		}

		if (fields.length === 0) {
			return new EmbedBuilder()
				.setColor("#2f3136")
				.setDescription("You do not have permission to use any Needle commands here.");
		}

		const builder = new EmbedBuilder().setColor("#2f3136").setFields(fields);
		if (!seeingAllCommands) {
			builder.setFooter({
				text: 'Only showing commands available to you in this channel.\nUse "/help filter: all" to see all commands 👈',
			});
		}

		return builder;
	}

	private async getCommandDescriptions(
		commands: NeedleCommand[],
		member: Nullish<GuildMember>,
		channel: Nullish<GuildTextBasedChannel>,
		showAll: boolean
	): Promise<string[]> {
		const output = [];
		for (const command of commands) {
			const { id, description, name } = command;

			const hasPermission = await command.hasPermissionToExecuteHere(member, channel);
			if (!showAll && hasPermission === false) continue;

			const commandSyntax = `</${name}:${id}>`;
			output.push(`${commandSyntax} — ${description}`);
		}

		return output;
	}
}
