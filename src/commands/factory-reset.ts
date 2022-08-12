import {
	ActionRowBuilder,
	ModalActionRowComponentBuilder,
	ModalBuilder,
	PermissionFlagsBits,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";
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
		const { replyInSecret, replyInPublic, interaction, messages } = context;

		// TODO: Open modal
		// await interaction.showModal(await this.getBuilder());

		const success = this.bot.configs.delete(interaction.guildId);
		return success
			? replyInPublic("Successfully reset Needle to factory settings.")
			: replyInSecret(messages.ERR_NO_EFFECT);
	}
}
