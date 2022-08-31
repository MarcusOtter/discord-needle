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

import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { clampWithElipse } from "../helpers/stringHelpers.js";
import type InteractionContext from "../models/InteractionContext.js";
import type NeedleCommand from "../models/NeedleCommand.js";

export default class CommandExecutorService {
	public async execute(command: NeedleCommand, context: InteractionContext): Promise<void> {
		try {
			await command.execute(context);
		} catch (e) {
			await this.handleError(context, e);
		}
	}

	private async handleError(context: InteractionContext, e: unknown) {
		console.error(e);
		if (context.interaction.replied || !context.interaction.isRepliable()) return;

		const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
			this.getBugReportButton(),
			this.getSupportServerButton()
		);

		await context.interaction.reply({
			content: clampWithElipse(context.settings.ErrorUnknown, 2000),
			ephemeral: true,
			components: [buttonRow],
		});
	}

	private getSupportServerButton(): ButtonBuilder {
		return new ButtonBuilder()
			.setEmoji("🙋")
			.setLabel("Support server")
			.setURL("https://discord.gg/8BmnndXHp6")
			.setStyle(ButtonStyle.Link);
	}

	private getBugReportButton(): ButtonBuilder {
		return new ButtonBuilder()
			.setEmoji("🐛")
			.setLabel("Report a bug")
			.setURL("https://needle.gg/suggest")
			.setStyle(ButtonStyle.Link);
	}
}
