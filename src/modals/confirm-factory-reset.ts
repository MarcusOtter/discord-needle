/*
This file is part of Needle.

Needle is free software: you can redistribute it and/or modify it under the terms of the GNU
Affero General Public License as published by the Free Software Foundation, either version 3 of
the License, or (at your option) any later version.

Needle is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even
the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero
General Public License for more details.

You should have received a copy of the GNU Affero General Public License along with Needle.
If not, see <https://www.gnu.org/licenses/>.
*/

import {
	ActionRowBuilder,
	type ModalActionRowComponentBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";
import type InteractionContext from "../models/InteractionContext.js";
import NeedleModal from "../models/NeedleModal.js";

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
			return replyInSecret("Action cancelled.");
		}

		const success = this.bot.configs.delete(interaction.guildId);
		return success
			? replyInPublic("Successfully reset Needle to factory settings.")
			: replyInSecret(settings.ErrorNoEffect);
	}
}
