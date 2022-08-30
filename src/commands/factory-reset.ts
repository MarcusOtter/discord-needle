import { PermissionFlagsBits } from "discord.js";
import CommandCategory from "../models/enums/CommandCategory.js";
import InteractionContext from "../models/InteractionContext.js";
import NeedleCommand from "../models/NeedleCommand.js";

export default class FactoryResetCommand extends NeedleCommand {
	public readonly name = "factory-reset";
	public readonly description = "Reset Needle to factory settings";
	public readonly category = CommandCategory.Configuration;
	protected readonly defaultPermissions = PermissionFlagsBits.ManageThreads;

	public async execute(context: InteractionContext): Promise<void> {
		if (!context.isSlashCommand() || !context.isInGuild()) return;
		const confirmationModal = this.bot.getModal("confirm-factory-reset");
		await context.interaction.showModal(confirmationModal.builder);
	}
}
