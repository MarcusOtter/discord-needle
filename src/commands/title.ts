// ________________________________________________________________________________________________
//
// This file is part of Needle.
//
// Needle is free software: you can redistribute it and/or modify it under the terms of the GNU
// Affero General Public License as published by the Free Software Foundation, either version 3 of
// the License, or (at your option) any later version.
//
// Needle is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even
// the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero
// General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License along with Needle.
// If not, see <https://www.gnu.org/licenses/>.
//
// ________________________________________________________________________________________________

import { SlashCommandBuilder } from "@discordjs/builders";
import { type CommandInteraction, GuildMember, Permissions } from "discord.js";
import { interactionReply, getMessage, getThreadAuthor } from "../helpers/messageHelpers";
import { setThreadName } from "../helpers/threadHelpers";
import type { NeedleCommand } from "../types/needleCommand";

export const command: NeedleCommand = {
	name: "title",
	shortHelpDescription: "Sets the title of a thread to `value`",
	longHelpDescription: "The title command changes the title of a thread.",

	async getSlashCommandBuilder() {
		return new SlashCommandBuilder()
			.setName("title")
			.setDescription("Sets the title of a thread")
			.addStringOption(option => {
				return option
					.setName("value")
					.setDescription("The new title of the thread")
					.setRequired(true);
			})
			.toJSON();
	},

	async execute(interaction: CommandInteraction): Promise<void> {
		const member = interaction.member;
		if (!(member instanceof GuildMember)) {
			return interactionReply(interaction, getMessage("ERR_UNKNOWN"));
		}

		const channel = interaction.channel;
		if (!channel?.isThread()) {
			return interactionReply(interaction, getMessage("ERR_ONLY_IN_THREAD"));
		}

		const newThreadName = interaction.options.getString("value");
		if (!newThreadName) {
			return interactionReply(interaction, getMessage("ERR_PARAMETER_MISSING"));
		}

		const oldThreadName = channel.name;
		if (oldThreadName === newThreadName) {
			return interactionReply(interaction, getMessage("ERR_NO_EFFECT"));
		}

		const hasChangeTitlePermissions = member
			.permissionsIn(channel)
			.has(Permissions.FLAGS.MANAGE_THREADS, true);

		if (hasChangeTitlePermissions) {
			await setThreadName(channel, newThreadName);
			await interactionReply(interaction, "Success!");
			return;
		}

		const threadAuthor = await getThreadAuthor(channel);
		if (!threadAuthor) {
			return interactionReply(interaction, getMessage("ERR_AMBIGUOUS_THREAD_AUTHOR"));
		}

		if (threadAuthor !== interaction.user) {
			return interactionReply(interaction, getMessage("ERR_ONLY_THREAD_OWNER"));
		}

		await setThreadName(channel, newThreadName);
		await interactionReply(interaction, "Success!");
	},
};
