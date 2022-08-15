import {
	ActionRowBuilder,
	ModalActionRowComponentBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";
import InteractionContext from "../models/InteractionContext";
import NeedleModal from "../models/NeedleModal";

export default class CustomTitleFormatModal extends NeedleModal {
	public readonly customId = "custom-title-format";
	public get builder(): ModalBuilder {
		const titleInput = new TextInputBuilder()
			.setCustomId("title")
			.setLabel("Title format")
			.setRequired(true)
			.setPlaceholder("$USER help: /^(.*)$/m")
			.setStyle(TextInputStyle.Short);
		const row = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(titleInput);
		return new ModalBuilder().setCustomId(this.customId).setTitle("Set a custom title format").addComponents(row);
	}

	// We only use openAndAwaitSubmit on this modal
	public submit(context: InteractionContext): Promise<void> {
		return context.replyInSecret(context.messages.ERR_UNKNOWN);
	}
}
