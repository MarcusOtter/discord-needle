import { EmbedBuilder, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import { Nullish, SlashCommandBuilderWithOptions } from "../helpers/typeHelpers";
import CommandCategory from "../models/enums/CommandCategory";
import CommandTag from "../models/enums/CommandTag";
import InteractionContext from "../models/InteractionContext";
import NeedleCommand from "../models/NeedleCommand";

export default class HelpCommand extends NeedleCommand {
	public readonly name = "help";
	public readonly description = "See Needle's commands";
	public readonly category = CommandCategory.Info;
	public readonly tags = [CommandTag.OnlyEphemeralReplies];

	public async execute(context: InteractionContext): Promise<void> {
		const useOldFormat = context.isSlashCommand() && context.interaction.options.getBoolean("from-phone");
		const commandsEmbed = await this.getCommandsEmbed(
			context.isInGuild(),
			useOldFormat,
			context.interaction.memberPermissions
		);
		await context.interaction.reply({
			embeds: [commandsEmbed],
			ephemeral: true,
		});
	}

	// Remove this as soon as all Discord clients supports command mentions
	// Behavior as of 2022-08-16: On Desktop it looks fine, on iOS it shows nothing, on Android it shows the raw input
	public addOptions(builder: SlashCommandBuilder): SlashCommandBuilderWithOptions {
		return builder.addBooleanOption(option =>
			option.setName("from-phone").setDescription("Are you writing this command on a phone?").setRequired(false)
		);
	}

	private async getCommandsEmbed(
		isInGuild: boolean,
		useOldFormat: Nullish<boolean>,
		memberPermissions: Nullish<PermissionsBitField>
	): Promise<EmbedBuilder> {
		const commands = await this.bot.getAllCommands();

		const fields = [];
		let seeingAllCommands = true;
		for (const category of Object.values(CommandCategory)) {
			const commandsInCategory = commands.filter(cmd => cmd.category === category);

			let value = "";
			for (const { id, description, name, tags, permissions } of commandsInCategory) {
				if (isInGuild && !memberPermissions?.has(permissions ?? 0n, true)) {
					seeingAllCommands = false;
					continue;
				}
				const tagEmojis = tags?.join("") ?? "";
				const command = !useOldFormat && id ? `</${name}:${id}>` : `/${name}`;
				value += `${command} ${tagEmojis} — ${description}\n`;
			}

			if (value.length > 0) {
				fields.push({ name: category, value });
			}
		}

		if (fields.length === 0) {
			return new EmbedBuilder()
				.setColor("#2f3136")
				.setDescription("You do not have permission to use any Needle commands");
		}

		const builder = new EmbedBuilder().setColor("#2f3136").setFields(fields);
		if (isInGuild && !seeingAllCommands) {
			builder.setFooter({ text: "Moderator commands are hidden 🔒" });
		}

		return builder;
	}
}
