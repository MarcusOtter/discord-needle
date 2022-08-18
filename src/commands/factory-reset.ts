import { PermissionFlagsBits } from "discord.js";
import CommandCategory from "../models/enums/CommandCategory";
import InteractionContext from "../models/InteractionContext";
import NeedleCommand from "../models/NeedleCommand";

export default class FactoryResetCommand extends NeedleCommand {
	public readonly name = "factory-reset";
	public readonly description = "Reset Needle to factory settings";
	public readonly category = CommandCategory.Configuration;
	public readonly permissions = PermissionFlagsBits.ManageThreads;

	public async execute(context: InteractionContext): Promise<void> {
		if (!context.isSlashCommand() || !context.isInGuild()) {
			return context.replyInSecret(context.validationError);
		}

		const confirmationModal = this.bot.getModal("confirm-factory-reset");
		await context.interaction.showModal(confirmationModal.builder);
	}
}
