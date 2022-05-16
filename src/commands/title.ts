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
import { type CommandInteraction, GuildMember, Permissions, Modal, TextInputComponent, MessageActionRow, ModalActionRowComponent, ModalSubmitInteraction } from "discord.js";
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
			// TODO: Maybe keep this but make it optional, and open modal if blank!

			// .addStringOption(option => {
			// 	return option
			// 		.setName("value")
			// 		.setDescription("The new title of the thread")
			// 		.setRequired(true);
			// })
			.toJSON();
	},

	async execute(interaction: CommandInteraction): Promise<void> {
		const member = interaction.member;
		if (!(member instanceof GuildMember)) {
			return interactionReply(interaction, getMessage("ERR_UNKNOWN", interaction.id));
		}

		const thread = interaction.channel;
		if (!thread?.isThread()) {
			return interactionReply(interaction, getMessage("ERR_ONLY_IN_THREAD", interaction.id));
		}

		let titlePlaceholder = thread.name.replaceAll("🆕", "");
		if (titlePlaceholder.length > 45) {
			titlePlaceholder = titlePlaceholder.slice(0, 42) + "...";
		}

		const modal = new Modal()
			.setCustomId(this.name)
			.setTitle("Set a new thread title");

		const titleInput = new TextInputComponent()
			.setCustomId("title")
			.setLabel("Thread title")
			.setMinLength(1)
			.setMaxLength(95)
			.setRequired(true)
			.setPlaceholder(titlePlaceholder)
			.setStyle("SHORT");

		const channelId = new TextInputComponent()
			.setCustomId("threadId")
			.setLabel("Thread ID (do not change)")
			.setMinLength(18)
			.setMaxLength(18)
			.setRequired(true)
			.setPlaceholder("Put it back! (Discord bug workaround)")
			.setStyle("SHORT")
			.setValue(interaction.channelId);


		const row = new MessageActionRow<ModalActionRowComponent>().addComponents(titleInput);
		const row2 = new MessageActionRow<ModalActionRowComponent>().addComponents(channelId);

		modal.addComponents(row, row2);

		return interaction.showModal(modal);


	},
	async handleModalSubmit(interaction: ModalSubmitInteraction): Promise<void> {
		const member = interaction.member;
		if (!(member instanceof GuildMember)) {
			return interactionReply(interaction, getMessage("ERR_UNKNOWN", interaction.id));
		}

		let thread = interaction.channel;
		if (!thread) {
			return interactionReply(interaction, getMessage("ERR_UNKNOWN", interaction.id));
		}

		// Very ugly workaround because Discord's modals don't know where they were opened from
		if (!thread?.isThread()) {
			const threadId = interaction.fields.getTextInputValue("threadId");
			const parent = await interaction.guild?.channels.fetch(thread.id);
			if (!parent?.isText()) {
				return interactionReply(interaction, getMessage("ERR_UNKNOWN", interaction.id));
			}
			thread = await parent.threads.fetch(threadId);
			if (!thread) {
				return interactionReply(interaction, getMessage("ERR_UNKNOWN", interaction.id));
			}
		}

		const newThreadName = interaction.fields.getTextInputValue("title");
		if (!newThreadName) {
			return interactionReply(interaction, getMessage("ERR_PARAMETER_MISSING", interaction.id));
		}

		const oldThreadName = thread.name;
		if (oldThreadName === newThreadName) {
			return interactionReply(interaction, getMessage("ERR_NO_EFFECT", interaction.id));
		}

		const hasChangeTitlePermissions = member
			.permissionsIn(thread)
			.has(Permissions.FLAGS.MANAGE_THREADS, true);

		if (hasChangeTitlePermissions) {
			await setThreadName(thread, newThreadName);
			await interactionReply(interaction, "Success!");
			return;
		}

		const threadAuthor = await getThreadAuthor(thread);
		if (!threadAuthor) {
			return interactionReply(interaction, getMessage("ERR_AMBIGUOUS_THREAD_AUTHOR", interaction.id));
		}

		if (threadAuthor !== interaction.user) {
			return interactionReply(interaction, getMessage("ERR_ONLY_THREAD_OWNER", interaction.id));
		}

		await setThreadName(thread, newThreadName);
		await interactionReply(interaction, "Success!");
	},
};
