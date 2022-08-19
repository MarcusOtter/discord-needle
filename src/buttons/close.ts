import { ButtonBuilder, ButtonStyle } from "discord.js";
import InteractionContext from "../models/InteractionContext";
import NeedleButton from "../models/NeedleButton";
import NeedleBot from "../NeedleBot";
import ObjectFactory from "../ObjectFactory";
import CommandExecutorService from "../services/CommandExecutorService";

export default class CloseButton extends NeedleButton {
	public readonly customId = "close";
	public getBuilder(): ButtonBuilder {
		return new ButtonBuilder()
			.setCustomId(this.customId)
			.setLabel("Archive thread") // TODO: Message key
			.setStyle(ButtonStyle.Success)
			.setEmoji("937932140014866492"); // :archive:
	}

	private readonly commandExecutor: CommandExecutorService;

	constructor(bot: NeedleBot) {
		super(bot);
		this.commandExecutor = ObjectFactory.createCommandExecutorService();
	}

	public async press(context: InteractionContext): Promise<void> {
		if (!context.isInGuild()) return;

		const closeCommand = this.bot.getCommand(this.customId);
		const { interaction, settings: messages, replyInSecret } = context;
		const { member, channel } = interaction;
		const hasPermission = await closeCommand.hasPermissionToExecuteHere(member, channel);
		if (!hasPermission) {
			return replyInSecret(messages.ErrorInsufficientUserPerms);
		}

		await this.commandExecutor.execute(closeCommand, context);
	}
}
