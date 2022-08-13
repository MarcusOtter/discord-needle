import { EmbedBuilder, PermissionsBitField } from "discord.js";
import { Nullish } from "../helpers/typeHelpers";
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
		const commandsEmbed = await this.getCommandsEmbed(context.interaction.memberPermissions);
		await context.interaction.reply({
			embeds: [commandsEmbed],
			ephemeral: true,
		});
	}

	private async getCommandsEmbed(memberPermissions: Nullish<PermissionsBitField>): Promise<EmbedBuilder> {
		const commands = await this.bot.getAllCommands();

		const fields = [];
		let seeingAllCommands = true;
		for (const category of Object.values(CommandCategory)) {
			const commandsInCategory = commands.filter(cmd => cmd.category === category);

			let value = "";
			for (const { id, description, name, tags, permissions } of commandsInCategory) {
				if (!memberPermissions?.has(permissions ?? 0n, true)) {
					seeingAllCommands = false;
					continue;
				}
				const tagEmojis = tags?.join("") ?? "";
				const command = id ? `</${name}:${id}>` : `\`/${name}\``;
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

		const footerText = seeingAllCommands
			? "You have access to all Needle commands ✨"
			: "Moderator commands are hidden 🔒";

		return new EmbedBuilder().setColor("#2f3136").setFields(fields).setFooter({ text: footerText });
	}
}
