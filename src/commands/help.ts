import { EmbedBuilder } from "discord.js";
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
		const commandsEmbed = await this.getCommandsEmbed();
		await context.interaction.reply({
			embeds: [commandsEmbed],
			ephemeral: true,
		});
	}

	// TODO: Only show commands user is permitted to use
	private async getCommandsEmbed(): Promise<EmbedBuilder> {
		const commands = await this.bot.getAllCommands();

		const fields = [];
		for (const category of Object.values(CommandCategory)) {
			const commandsInCategory = commands.filter(cmd => cmd.category === category);

			let value = "";
			for (const { id, description, name, tags } of commandsInCategory) {
				const tagEmojis = tags?.join("") ?? "";
				const command = id ? `</${name}:${id}>` : `\`/${name}\``;
				value += `${command} ${tagEmojis} — ${description}\n`;
			}

			if (value.length > 0) {
				fields.push({ name: category, value });
			}
		}

		return new EmbedBuilder().setColor("#2f3136").setFields(fields);
	}
}
