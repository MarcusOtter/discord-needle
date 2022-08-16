import {
	ActionRowBuilder,
	ModalActionRowComponentBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";
import NeedleModal from "../models/NeedleModal";

export default class CustomReplyMessageModal extends NeedleModal {
	public customId = "custom-reply-message";
	public get builder(): ModalBuilder {
		const messageInput = new TextInputBuilder()
			.setCustomId("message")
			.setLabel("Custom message")
			.setRequired(false)
			.setPlaceholder("Thread automatically created by $USER in $CHANNEL.")
			.setStyle(TextInputStyle.Paragraph);
		const row = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(messageInput);
		return new ModalBuilder().setCustomId(this.customId).setTitle("Set a custom reply message").addComponents(row);
	}

	public async submit(): Promise<void> {
		// Not used, we only use openAndAwaitSubmit on this modal
	}
}
