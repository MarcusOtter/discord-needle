import {
	ActionRowBuilder,
	ModalActionRowComponentBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";
import InteractionContext from "../models/InteractionContext";
import NeedleModal from "../models/NeedleModal";

export default class ConfirmFactoryResetModal extends NeedleModal {
	public readonly customId = "confirm-factory-reset";

	public async getBuilder(): Promise<ModalBuilder> {
		const modal = new ModalBuilder()
			.setCustomId("confirm-factory-reset")
			.setTitle("Reset Needle to factory settings");

		const confirmInput = new TextInputBuilder()
			.setCustomId("confirm")
			.setLabel("Factory reset? (yes/no)")
			.setValue("Yes")
			.setPlaceholder("No")
			.setRequired(false)
			.setStyle(TextInputStyle.Short);

		const row = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents([confirmInput]);
		modal.addComponents(row);
		return modal;
	}

	public submit(context: InteractionContext): Promise<void> {
		if (!context.isInGuild()) {
			return context.replyInSecret(context.validationError);
		}
		const { replyInSecret, replyInPublic, interaction, messages } = context;

		const success = this.bot.configs.delete(interaction.guildId);
		return success
			? replyInPublic("Successfully reset Needle to factory settings.")
			: replyInSecret(messages.ERR_NO_EFFECT);
	}
}
