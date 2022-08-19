import { ButtonBuilder, ButtonStyle } from "discord.js";
import type InteractionContext from "../models/InteractionContext";
import NeedleButton from "../models/NeedleButton";
import type NeedleBot from "../NeedleBot";
import ObjectFactory from "../ObjectFactory";
import type CommandExecutorService from "../services/CommandExecutorService";

export default class HelpButton extends NeedleButton {
	public readonly customId = "help";
	public getBuilder(): ButtonBuilder {
		return new ButtonBuilder()
			.setCustomId(this.customId)
			.setLabel("Commands")
			.setStyle(ButtonStyle.Secondary)
			.setEmoji("937931337942306877"); // :slash_commands:
	}

	private readonly commandExecutor: CommandExecutorService;

	constructor(bot: NeedleBot) {
		super(bot);
		this.commandExecutor = ObjectFactory.createCommandExecutorService();
	}

	public async press(context: InteractionContext): Promise<void> {
		const helpCommand = this.bot.getCommand(this.customId);
		if (!context.isInGuild()) {
			await this.commandExecutor.execute(helpCommand, context);
			return;
		}

		const { messages, interaction, replyInSecret } = context;
		const { member, channel } = interaction;
		const hasPermission = await helpCommand.hasPermissionToExecuteHere(member, channel);
		if (!hasPermission) {
			return replyInSecret(messages.ERR_INSUFFICIENT_PERMS);
		}

		await this.commandExecutor.execute(helpCommand, context);
	}
}
