// TODO: Make all the imports into types that can be
// TODO: Add license notices
import {
	AnyThreadChannel,
	ButtonInteraction,
	ChatInputCommandInteraction,
	GuildMember,
	GuildTextBasedChannel,
	MessageComponentInteraction,
	ModalSubmitInteraction,
} from "discord.js";
import { Overwrite } from "../helpers/typeHelpers";
import type NeedleBot from "../NeedleBot";
import MessageVariables from "./MessageVariables";
import NeedleConfig from "./NeedleConfig";
import { ModalOpenableInteraction } from "./NeedleModal";

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

		await this.interaction.reply({ content: content, ephemeral: ephemeral });
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
