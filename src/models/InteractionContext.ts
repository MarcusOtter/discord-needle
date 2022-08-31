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

import type {
	AnyThreadChannel,
	ButtonInteraction,
	ChatInputCommandInteraction,
	GuildMember,
	GuildTextBasedChannel,
	MessageComponentInteraction,
	ModalSubmitInteraction,
} from "discord.js";
import { clampWithElipse } from "../helpers/stringHelpers.js";
import type { Overwrite } from "../helpers/typeHelpers.js";
import type NeedleBot from "../NeedleBot.js";
import MessageVariables from "./MessageVariables.js";
import type NeedleConfig from "./NeedleConfig.js";
import type { ModalOpenableInteraction } from "./NeedleModal.js";

export default class InteractionContext {
	public readonly bot: NeedleBot;
	public readonly settings: NeedleConfig["settings"];
	public readonly messageVariables: MessageVariables;

	public get interaction(): NeedleInteraction {
		return this.interactionToReplyTo;
	}

	private interactionToReplyTo: NeedleInteraction;
	private latestErrorMessage: string | undefined;

	constructor(bot: NeedleBot, interaction: NeedleInteraction) {
		this.bot = bot;
		this.interactionToReplyTo = interaction;
		this.settings = bot.configs.get(interaction.guildId ?? "").settings;
		this.messageVariables = new MessageVariables().setUser(interaction.user);

		if (!this.isInGuild()) return;
		this.messageVariables.setUser(this.interaction.member).setChannel(this.interaction.channel);
	}

	// Keep reply methods as arrow functions to avoid losing "this" context
	public replyInSecret = (content: string | undefined): Promise<void> => {
		return this.reply(content, true);
	};

	public replyInPublic = (content: string | undefined): Promise<void> => {
		return this.reply(content, false);
	};

	public replyWithErrors = (): Promise<void> => {
		return this.reply(this.latestErrorMessage, true);
	};

	public setInteractionToReplyTo(interaction: NeedleInteraction | undefined) {
		if (!interaction) return;
		this.interactionToReplyTo = interaction;
	}

	public isInThread(): this is ContextWithInteraction<GuildInteraction & AnyThreadInteraction> {
		if (this.interaction.channel?.isThread()) return true;
		this.latestErrorMessage = this.settings.ErrorOnlyInThread;
		return false;
	}

	public isModalOpenable(): this is ContextWithInteraction<ModalOpenableInteraction> {
		return this.isInGuild() && (this.isSlashCommand() || this.isButtonPress());
	}

	public isInGuild(): this is ContextWithInteraction<GuildInteraction> {
		return !this.interaction.channel?.isDMBased();
	}

	public isSlashCommand(): this is ContextWithInteraction<ChatInputCommandInteraction> {
		if (this.interaction.isChatInputCommand()) return true;
		this.latestErrorMessage = this.settings.ErrorUnknown;
		return false;
	}

	public isModalSubmit(): this is ContextWithInteraction<ModalSubmitInteraction> {
		if (this.interaction.isModalSubmit()) return true;
		this.latestErrorMessage = this.settings.ErrorUnknown;
		return false;
	}

	public isButtonPress(): this is ContextWithInteraction<ButtonInteraction> {
		if (this.interaction.isButton()) return true;
		this.latestErrorMessage = this.settings.ErrorUnknown;
		return false;
	}

	private async reply(content: string | undefined, ephemeral: boolean): Promise<void> {
		content = await this.messageVariables.replace(content ?? "");
		if (!content || content.length === 0) {
			console.warn("Tried sending empty message");
			return;
		}

		if (this.interaction.replied) return;
		await this.interaction.reply({ content: clampWithElipse(content, 2000), ephemeral: ephemeral });
	}
}

export type GuildInteraction = Overwrite<
	NeedleInteraction,
	{ member: GuildMember; guildId: string; channel: GuildTextBasedChannel }
>;
type AnyThreadInteraction = Overwrite<NeedleInteraction, { channel: AnyThreadChannel }>;

type ContextWithInteraction<TInteraction> = Overwrite<InteractionContext, { interaction: TInteraction }>;

// Little type hack with Omit to remove private members from djs types
export type NeedleInteraction = Omit<
	ChatInputCommandInteraction | MessageComponentInteraction | ModalSubmitInteraction,
	""
>;
