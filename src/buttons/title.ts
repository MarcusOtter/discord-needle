import { ButtonBuilder, ButtonStyle } from "discord.js";
import InteractionContext from "../models/InteractionContext";
import NeedleButton from "../models/NeedleButton";
import NeedleBot from "../NeedleBot";
import ObjectFactory from "../ObjectFactory";
import CommandExecutorService from "../services/CommandExecutorService";

export default class TitleButton extends NeedleButton {
	public customId = "title";
	private readonly commandExecutor: CommandExecutorService;

	constructor(bot: NeedleBot) {
		super(bot);
		this.commandExecutor = ObjectFactory.createCommandExecutorService();
	}

	public getBuilder(): ButtonBuilder {
		return new ButtonBuilder()
			.setCustomId(this.customId)
			.setLabel("Edit title")
			.setStyle(ButtonStyle.Primary)
			.setEmoji("1010182200018350111"); // :title_3_0:
	}

	public async press(context: InteractionContext): Promise<void> {
		if (!context.isInGuild()) return;

		if (!context.bot.isAllowedToRename(context.interaction.channel.id)) {
			return context.replyInSecret(context.settings.ErrorMaxThreadRenames);
		}

		const titleCommand = this.bot.getCommand(this.customId);
		const { interaction, settings, replyInSecret } = context;
		const { member, channel } = interaction;
		const hasPermission = await titleCommand.hasPermissionToExecuteHere(member, channel);
		if (!hasPermission) {
			return replyInSecret(settings.ErrorInsufficientUserPerms);
		}

		await this.commandExecutor.execute(titleCommand, context);
	}
}