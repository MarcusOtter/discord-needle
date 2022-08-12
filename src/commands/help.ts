import { EmbedBuilder } from "discord.js";
import ChannelType from "../models/enums/ChannelType";
import InteractionContext from "../models/InteractionContext";
import NeedleCommand from "../models/NeedleCommand";

export default class HelpCommand extends NeedleCommand {
	public readonly name = "help";
	public readonly description = "Shows Needle's commands";
	public readonly allowedChannels = ChannelType.Any;

	public async execute(context: InteractionContext): Promise<void> {
		if (!context.isInGuild()) {
			return context.replyInSecret(context.validationError);
		}

		const descriptionEmbed = this.getDescriptionEmbed();
		const commandsEmbed = await this.getCommandsEmbed();

		await context.interaction.reply({
			embeds: [descriptionEmbed, commandsEmbed],
			ephemeral: true,
		});
	}

	// TODO: Maybe remove this and put it in info instead or something
	private getDescriptionEmbed() {
		return new EmbedBuilder()
			.setColor("#2f3136")
			.setDescription(
				"Needle is a bot that creates [threads](https://discord.com/blog/connect-the-conversation-with-threads-on-discord) in certain channels automatically. You can interact with Needle through [slash commands](https://support.discord.com/hc/en-us/articles/1500000368501-Slash-Commands-FAQ) and buttons. If you want help with using this bot, feel free to join the [support server](https://discord.gg/8BmnndXHp6)."
			);
	}

	// TODO: Only show commands user is permitted to use
	// TODO: Emojis and stuff if output is hidden/ephemeral, etc
	private async getCommandsEmbed(): Promise<EmbedBuilder> {
		const commands = await this.bot.getAllCommands();

		let commandsForThreads = "";
		let commandsForAnything = "";
		for (const { id, description, name, allowedChannels } of commands) {
			const commandInfo = `</${name}:${id}> — ${description}\n`;

			if (allowedChannels === ChannelType.Thread) {
				commandsForThreads += commandInfo;
			} else if (allowedChannels === ChannelType.Any) {
				commandsForAnything += commandInfo;
			}
		}

		return new EmbedBuilder()
			.setTitle("COMMANDS")
			.setColor("#2f3136")
			.setFields(
				{ name: "In threads", value: commandsForThreads },
				{ name: "Anywhere", value: commandsForAnything }
			);
	}
}
