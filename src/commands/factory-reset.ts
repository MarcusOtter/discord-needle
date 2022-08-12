import { PermissionFlagsBits } from "discord.js";
import CommandCategory from "../models/enums/CommandCategory";
import CommandTag from "../models/enums/CommandTag";
import InteractionContext from "../models/InteractionContext";
import NeedleCommand from "../models/NeedleCommand";

export default class FactoryResetCommand extends NeedleCommand {
	public readonly name = "factory-reset";
	public readonly description = "Reset Needle to factory settings";
	public readonly category = CommandCategory.Configuration;
	public readonly tags = [CommandTag.RequiresSpecialPermissions];
	public readonly permissions = PermissionFlagsBits.ManageThreads;

	public async execute(context: InteractionContext): Promise<void> {
		if (!context.isSlashCommand() || !context.isInGuild()) {
			return context.replyInSecret(context.validationError);
		}
		const { replyInSecret, interaction, messages } = context;

		const confirmationModal = this.bot.getModal("confirm-factory-reset");
		if (!confirmationModal) return replyInSecret(messages.ERR_UNKNOWN);

		const modalBuilder = await confirmationModal.getBuilder();
		await interaction.showModal(modalBuilder);
	}
}
