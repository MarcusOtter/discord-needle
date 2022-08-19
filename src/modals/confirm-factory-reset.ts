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
	public get builder(): ModalBuilder {
		const confirmInput = new TextInputBuilder()
			.setCustomId("confirm")
			.setLabel("Factory reset? (yes/no)")
			.setValue("Yes")
			.setPlaceholder("No")
			.setRequired(false)
			.setStyle(TextInputStyle.Short);

		const row = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents([confirmInput]);
		return new ModalBuilder()
			.setCustomId(this.customId)
			.setTitle("Reset Needle to factory settings")
			.addComponents(row);
	}

	public async submit(context: InteractionContext): Promise<void> {
		if (!context.isInGuild() || !context.isModalSubmit()) return;

		const { replyInSecret, replyInPublic, interaction, settings } = context;
		const isConfirmed = interaction.fields.getTextInputValue("confirm").toLowerCase() === "yes";
		if (!isConfirmed) {
			return replyInSecret("Action cancelled."); // TODO: Add message for this
		}

		// TODO: Maybe add a kick button or something
		// In that case add an ephemeral reply with those buttons and a public one stating the reset
		const success = this.bot.configs.delete(interaction.guildId);
		return success
			? replyInPublic("Successfully reset Needle to factory settings.")
			: replyInSecret(settings.ErrorNoEffect);
	}
}
