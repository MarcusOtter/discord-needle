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

import { PermissionFlagsBits, type SlashCommandBuilder } from "discord.js";
import type { SlashCommandBuilderWithOptions } from "../helpers/typeHelpers.js";
import CommandCategory from "../models/enums/CommandCategory.js";
import Setting from "../models/enums/Setting.js";
import type InteractionContext from "../models/InteractionContext.js";
import NeedleCommand from "../models/NeedleCommand.js";

export default class SettingCommand extends NeedleCommand {
	public readonly name = "setting";
	public readonly description = "View or change Needle settings for this server";
	public readonly category = CommandCategory.Configuration;
	protected readonly defaultPermissions = PermissionFlagsBits.ManageThreads;

	public addOptions(builder: SlashCommandBuilder): SlashCommandBuilderWithOptions {
		const keys = Object.keys(Setting).filter(v => isNaN(Number(v))) as (keyof typeof Setting)[];
		const choices = keys.map(key => {
			return { name: key, value: Setting[key] };
		});

		return builder.addIntegerOption(option =>
			option
				.setName("setting-name")
				.setDescription("The name of the setting")
				.setRequired(true)
				.setChoices(...choices)
		);
	}

	public async execute(context: InteractionContext): Promise<void> {
		if (!context.isModalOpenable() || !context.isSlashCommand()) return;

		const guildId = context.interaction.guildId;
		const setting = context.interaction.options.getInteger("setting-name", true) as Setting;
		const settingName = Setting[setting] as keyof typeof Setting;
		const autoThreadConfig = this.bot.configs.get(guildId);
		const oldValue = autoThreadConfig.settings[settingName];

		const modal = this.bot.getModal("setting");
		const submitInteraction = await modal.openAndAwaitSubmit(
			context.interaction,
			[{ customId: "setting", value: oldValue }],
			settingName
		);

		context.setInteractionToReplyTo(submitInteraction);

		const newValue = submitInteraction.fields.getTextInputValue("setting");
		if (oldValue === newValue) {
			return context.replyInSecret(context.settings.ErrorNoEffect);
		}

		if (newValue.trim().length === 0) {
			return context.replyInSecret("Setting must be at least 1 non-whitespace character.");
		}

		autoThreadConfig.settings[settingName] = newValue;
		this.bot.configs.set(guildId, autoThreadConfig);

		await context.replyInSecret("Setting successfully changed.");
	}
}
