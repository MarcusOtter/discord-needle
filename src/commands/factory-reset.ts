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

import { PermissionFlagsBits } from "discord.js";
import CommandCategory from "../models/enums/CommandCategory.js";
import type InteractionContext from "../models/InteractionContext.js";
import NeedleCommand from "../models/NeedleCommand.js";

export default class FactoryResetCommand extends NeedleCommand {
	public readonly name = "factory-reset";
	public readonly description = "Reset Needle to factory settings";
	public readonly category = CommandCategory.Configuration;
	protected readonly defaultPermissions = PermissionFlagsBits.ManageThreads;

	public async execute(context: InteractionContext): Promise<void> {
		if (!context.isSlashCommand() || !context.isInGuild()) return;
		const confirmationModal = this.bot.getModal("confirm-factory-reset");
		await context.interaction.showModal(confirmationModal.builder);
	}
}
