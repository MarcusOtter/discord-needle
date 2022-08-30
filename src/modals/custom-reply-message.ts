import {
	ActionRowBuilder,
	type ModalActionRowComponentBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";
import NeedleModal from "../models/NeedleModal.js";

export default class CustomReplyMessageModal extends NeedleModal {
	public readonly customId = "custom-reply-message";
	public get builder(): ModalBuilder {
		const messageInput = new TextInputBuilder()
			.setCustomId("message")
			.setLabel("Custom message (empty = hidden)")
			.setRequired(false)
			.setPlaceholder("Hidden")
			.setStyle(TextInputStyle.Paragraph)
			.setMaxLength(2000);
		const row = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(messageInput);
		return new ModalBuilder().setCustomId(this.customId).setTitle("Set a custom reply message").addComponents(row);
	}

	public async submit(): Promise<void> {
		// Not used, we only use openAndAwaitSubmit on this modal
	}
}
