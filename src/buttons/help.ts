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

export default class HelpButton extends NeedleButton {
	public readonly customId = "help";
	private readonly commandExecutor: CommandExecutorService;

	constructor(bot: NeedleBot) {
		super(bot);
		this.commandExecutor = ObjectFactory.createCommandExecutorService();
	}

	public getBuilder(): ButtonBuilder {
		return new ButtonBuilder()
			.setCustomId(this.customId)
			.setStyle(ButtonStyle.Secondary)
			.setEmoji("937931337942306877"); // :slash_commands:
	}

	public async press(context: InteractionContext): Promise<void> {
		const helpCommand = this.bot.getCommand(this.customId);
		if (!context.isInGuild()) {
			await this.commandExecutor.execute(helpCommand, context);
			return;
		}

		const { settings: messages, interaction, replyInSecret } = context;
		const { member, channel } = interaction;
		const hasPermission = await helpCommand.hasPermissionToExecuteHere(member, channel);
		if (!hasPermission) {
			return replyInSecret(messages.ErrorInsufficientUserPerms);
		}

		await this.commandExecutor.execute(helpCommand, context);
	}
}
