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

import type { ButtonInteraction, ChatInputCommandInteraction, ModalBuilder, ModalSubmitInteraction } from "discord.js";
import type NeedleBot from "../NeedleBot.js";
import type InteractionContext from "./InteractionContext.js";
import type { GuildInteraction } from "./InteractionContext.js";
import { ModalTextInput } from "./ModalTextInput.js";

export default abstract class NeedleModal {
	public abstract readonly customId: string;
	public abstract readonly builder: ModalBuilder;

	protected readonly bot: NeedleBot;

	constructor(bot: NeedleBot) {
		this.bot = bot;
	}

	public abstract submit(context: InteractionContext): Promise<void>;

	public async openAndAwaitSubmit(
		interaction: ModalOpenableInteraction,
		defaultValues: ModalTextInput[],
		titleOverride?: string
	): Promise<ModalSubmitInteraction> {
		const builder = this.builder;
		builder.setComponents(
			builder.components.map(row =>
				row.setComponents(
					row.components[0].setValue(
						defaultValues.find(s => s.customId === row.components[0].data.custom_id)?.value ?? ""
					)
				)
			)
		);
		if (titleOverride && titleOverride.length > 0) {
			builder.setTitle(titleOverride);
		}

		await interaction.showModal(builder);
		return interaction.awaitModalSubmit({
			time: 1000 * 60 * 15, // 15 min
			filter: x => x.customId === this.customId && x.user.id === interaction.user.id,
		});
	}
}

export type ModalOpenableInteraction = GuildInteraction & (ChatInputCommandInteraction | ButtonInteraction);
