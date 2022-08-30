import {
	ActionRowBuilder,
	type ModalActionRowComponentBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";
import NeedleModal from "../models/NeedleModal.js";

export default class CustomReplyButtonsModal extends NeedleModal {
	public customId = "custom-reply-buttons";
	public get builder(): ModalBuilder {
		const closeText = this.getTextInput("Close");
		const closeStyle = this.getStyleInput("Close", "Green");
		const titleText = this.getTextInput("Title");
		const titleStyle = this.getStyleInput("Title", "Blurple");

		return new ModalBuilder()
			.setCustomId(this.customId)
			.setTitle("Set custom buttons")
			.setComponents(
				this.makeRow(closeText),
				this.makeRow(closeStyle),
				this.makeRow(titleText),
				this.makeRow(titleStyle)
			);
	}

	public async submit(): Promise<void> {
		// Not used, we only use openAndAwaitSubmit on this modal
	}

	private makeRow(input: TextInputBuilder): ActionRowBuilder<ModalActionRowComponentBuilder> {
		return new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(input);
	}

	private getTextInput(name: string): TextInputBuilder {
		return new TextInputBuilder()
			.setCustomId(name.toLowerCase() + "Text")
			.setLabel(name + " button text (empty = hidden)")
			.setRequired(false)
			.setPlaceholder("Hidden")
			.setStyle(TextInputStyle.Short)
			.setMaxLength(80);
	}

	private getStyleInput(name: string, placeholder: string): TextInputBuilder {
		return new TextInputBuilder()
			.setCustomId(name.toLowerCase() + "Style")
			.setLabel(name + " button style (blurple/grey/green/red)")
			.setRequired(true)
			.setPlaceholder(placeholder.toUpperCase())
			.setStyle(TextInputStyle.Short)
			.setMinLength("red".length)
			.setMaxLength("blurple".length);
	}
}
