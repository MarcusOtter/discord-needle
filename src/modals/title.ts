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
