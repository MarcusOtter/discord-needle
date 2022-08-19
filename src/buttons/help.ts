import { ButtonBuilder, ButtonStyle } from "discord.js";
import type InteractionContext from "../models/InteractionContext";
import NeedleButton from "../models/NeedleButton";
import type NeedleBot from "../NeedleBot";
import ObjectFactory from "../ObjectFactory";
import type CommandExecutorService from "../services/CommandExecutorService";

export default class HelpButton extends NeedleButton {
	private readonly commandExecutor: CommandExecutorService;

	constructor(customId: string, bot: NeedleBot) {
		super(customId, bot);
		this.commandExecutor = ObjectFactory.createCommandExecutorService();
	}

	public async getBuilder(): Promise<ButtonBuilder> {
		return new ButtonBuilder()
			.setCustomId(this.customId)
			.setLabel("Commands")
			.setStyle(ButtonStyle.Secondary)
			.setEmoji("937931337942306877"); // :slash_commands:
	}

	public async press(context: InteractionContext): Promise<void> {
		const helpCommand = this.bot.getCommand(this.customId);
		if (!context.isInGuild() || !context.isButtonPress()) return; // some better message

		const { interaction, replyInSecret, messages } = context;
		const { channel, member } = interaction;
		const hasPermission = await helpCommand.hasPermissionToExecute(member, channel);
		if (!hasPermission) {
			// TODO: Message key
			return replyInSecret(
				"You do not have permission to perform this action. Contact an admin if you think this is a mistake."
			);
		}

		await this.commandExecutor.execute(helpCommand, context);
	}
}
