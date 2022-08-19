import { EmbedBuilder, PermissionsBitField } from "discord.js";
import { Nullish } from "../helpers/typeHelpers";
import CommandCategory from "../models/enums/CommandCategory";
import InteractionContext from "../models/InteractionContext";
import NeedleCommand from "../models/NeedleCommand";

export default class HelpCommand extends NeedleCommand {
	public readonly name = "help";
	public readonly description = "See Needle's commands";
	public readonly category = CommandCategory.Info;

	public async execute(context: InteractionContext): Promise<void> {
		const commandsEmbed = await this.getCommandsEmbed(context.isInGuild(), context.interaction.memberPermissions);
		await context.interaction.reply({
			content: "Need more help with Needle? Join us in the [support server](https://discord.gg/8BmnndXHp6)!",
			embeds: [commandsEmbed],
			ephemeral: true,
		});
	}

	private async getCommandsEmbed(
		isInGuild: boolean,
		memberPermissions: Nullish<PermissionsBitField>
	): Promise<EmbedBuilder> {
		const commands = await this.bot.getAllCommands();

		const fields = [];
		// let seeingAllCommands = true;
		for (const category of Object.values(CommandCategory)) {
			const commandsInCategory = commands.filter(cmd => cmd.category === category);

			let value = "";
			// TODO: Use actual permissions, not only the default override like here
			// Should change naming to be more clear
			for (const { description, name, hasPermissionToExecute } of commandsInCategory) {
				// if (isInGuild && !memberPermissions?.has(permissions ?? 0n, true)) {
				// 	seeingAllCommands = false;
				// 	continue;
				// }
				const command = `\`/${name}\``;
				value += `${command} — ${description}\n`;
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
		// if (isInGuild && !seeingAllCommands) {
		// 	builder.setFooter({ text: "Moderator commands are hidden 🔒" });
		// }

		return builder;
	}
}
