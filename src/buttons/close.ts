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

import { ButtonBuilder, ButtonStyle } from "discord.js";
import type InteractionContext from "../models/InteractionContext.js";
import NeedleButton from "../models/NeedleButton.js";
import type NeedleBot from "../NeedleBot.js";
import ObjectFactory from "../ObjectFactory.js";
import type CommandExecutorService from "../services/CommandExecutorService.js";

export default class CloseButton extends NeedleButton {
	public readonly customId = "close";
	private readonly commandExecutor: CommandExecutorService;

	constructor(bot: NeedleBot) {
		super(bot);
		this.commandExecutor = ObjectFactory.createCommandExecutorService();
	}

	public getBuilder(): ButtonBuilder {
		return new ButtonBuilder()
			.setCustomId(this.customId)
			.setLabel("Archive thread")
			.setStyle(ButtonStyle.Success)
			.setEmoji("1010182198923636797"); // :archive_3_0:
	}

	public async press(context: InteractionContext): Promise<void> {
		if (!context.isInGuild()) return;

		const closeCommand = this.bot.getCommand(this.customId);
		const { interaction, settings, replyInSecret } = context;
		const { member, channel } = interaction;
		const hasPermission = await closeCommand.hasPermissionToExecuteHere(member, channel);
		if (!hasPermission) {
			return replyInSecret(settings.ErrorInsufficientUserPerms);
		}

		await this.commandExecutor.execute(closeCommand, context);
	}
}
