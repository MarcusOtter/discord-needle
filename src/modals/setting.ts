import {
	ActionRowBuilder,
	ModalActionRowComponentBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";
import NeedleModal from "../models/NeedleModal";

export default class SettingModal extends NeedleModal {
	public readonly customId = "setting";
	public get builder(): ModalBuilder {
		const messageInput = new TextInputBuilder()
			.setCustomId("setting")
			.setLabel("value")
			.setRequired(true)
			.setStyle(TextInputStyle.Short);
		const row = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(messageInput);
		return new ModalBuilder().setCustomId(this.customId).setTitle("Change setting value").addComponents(row);
	}

	public async submit(): Promise<void> {
		// Not used, we only use openAndAwaitSubmit on this modal
	}
}
