import { ButtonBuilder, ButtonStyle } from "discord.js";
import type InteractionContext from "../models/InteractionContext.js";
import NeedleButton from "../models/NeedleButton.js";
import type NeedleBot from "../NeedleBot.js";
import ObjectFactory from "../ObjectFactory.js";
import type CommandExecutorService from "../services/CommandExecutorService.js";

export default class CloseButton extends NeedleButton {
	public readonly customId = "close";
	private readonly commandExecutor: CommandExecutorService;

	constructor(bot: NeedleBot) {
		super(bot);
		this.commandExecutor = ObjectFactory.createCommandExecutorService();
	}

	public getBuilder(): ButtonBuilder {
		return new ButtonBuilder()
			.setCustomId(this.customId)
			.setLabel("Archive thread")
			.setStyle(ButtonStyle.Success)
			.setEmoji("1010182198923636797"); // :archive_3_0:
	}

	public async press(context: InteractionContext): Promise<void> {
		if (!context.isInGuild()) return;

		const closeCommand = this.bot.getCommand(this.customId);
		const { interaction, settings, replyInSecret } = context;
		const { member, channel } = interaction;
		const hasPermission = await closeCommand.hasPermissionToExecuteHere(member, channel);
		if (!hasPermission) {
			return replyInSecret(settings.ErrorInsufficientUserPerms);
		}

		await this.commandExecutor.execute(closeCommand, context);
	}
}
