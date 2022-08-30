import {
	ActionRowBuilder,
	ModalActionRowComponentBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";
import NeedleModal from "../models/NeedleModal.js";

export default class TitleModal extends NeedleModal {
	public readonly customId = "title";
	public get builder(): ModalBuilder {
		const messageInput = new TextInputBuilder()
			.setCustomId("title")
			.setLabel("Title")
			.setRequired(true)
			.setStyle(TextInputStyle.Short)
			.setMinLength(1)
			.setMaxLength(100);
		const row = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(messageInput);
		return new ModalBuilder().setCustomId(this.customId).setTitle("Set thread title").addComponents(row);
	}

	public async submit(): Promise<void> {
		// Not used, we only use openAndAwaitSubmit on this modal
	}
}
