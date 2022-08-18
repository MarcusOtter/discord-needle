import {
	ActionRowBuilder,
	ModalActionRowComponentBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";
import NeedleModal from "../models/NeedleModal";

export default class CustomTitleFormatModal extends NeedleModal {
	public readonly customId = "custom-title-format";
	public get builder(): ModalBuilder {
		const titleInput = new TextInputBuilder()
			.setCustomId("title")
			.setLabel("Title format (RegEx supported)")
			.setRequired(true)
			.setPlaceholder("/^((.|\\s){0,40})/ig")
			.setStyle(TextInputStyle.Short);
		const row = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(titleInput);
		return new ModalBuilder().setCustomId(this.customId).setTitle("Set a custom title format").addComponents(row);
	}

	public async submit(): Promise<void> {
		// Not used, we only use openAndAwaitSubmit on this modal
	}
}
