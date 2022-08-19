import { EmbedBuilder, GuildMember, GuildTextBasedChannel } from "discord.js";
import { Nullish } from "../helpers/typeHelpers";
import CommandCategory from "../models/enums/CommandCategory";
import InteractionContext from "../models/InteractionContext";
import NeedleCommand from "../models/NeedleCommand";

export default class HelpCommand extends NeedleCommand {
	public readonly name = "help";
	public readonly description = "See Needle's commands";
	public readonly category = CommandCategory.Info;

	public async execute(context: InteractionContext): Promise<void> {
		const isInGuild = context.isInGuild();
		const member = isInGuild ? context.interaction.member : null;
		const channel = isInGuild ? context.interaction.channel : null;
		const commandsEmbed = await this.getCommandsEmbed(isInGuild, member, channel);

		await context.interaction.reply({
			content: "Need more help with Needle? Join us in the [support server](https://discord.gg/8BmnndXHp6)!",
			embeds: [commandsEmbed],
			ephemeral: true,
		});
	}

	private async getCommandsEmbed(
		isInGuild: boolean,
		member: Nullish<GuildMember>,
		channel: Nullish<GuildTextBasedChannel>
	): Promise<EmbedBuilder> {
		const commands = await this.bot.getAllCommands();

		const fields = [];
		let seeingAllCommands = true;
		for (const category of Object.values(CommandCategory)) {
			const commandsInCategory = commands.filter(cmd => cmd.category === category);
			const descriptions = await this.getCommandDescriptions(commandsInCategory, member, channel);

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
				.setDescription("You do not have permission to use any Needle commands");
		}

		const builder = new EmbedBuilder().setColor("#2f3136").setFields(fields);
		if (isInGuild && !seeingAllCommands) {
			builder.setFooter({ text: "Only showing commands available to you in this channel 🔒" });
		}

		return builder;
	}

	private async getCommandDescriptions(
		commands: NeedleCommand[],
		member: Nullish<GuildMember>,
		channel: Nullish<GuildTextBasedChannel>
	): Promise<string[]> {
		const output = [];
		for (const { description, name, hasPermissionToExecute } of commands) {
			const hasPermission = member && channel && (await hasPermissionToExecute(member, channel));
			if (hasPermission === false) continue;

			const command = `\`/${name}\``;
			output.push(`${command} — ${description}`);
		}

		return output;
	}
}
