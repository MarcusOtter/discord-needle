// TODO: Make all the imports into types that can be
// TODO: Add license notices
import {
	ButtonInteraction,
	ChannelType,
	ChatInputCommandInteraction,
	GuildMember,
	GuildTextBasedChannel,
	MessageComponentInteraction,
	ModalSubmitInteraction,
	PublicThreadChannel,
} from "discord.js";
import { Overwrite } from "../helpers/typeHelpers";
import type NeedleBot from "../NeedleBot";
import MessageVariables from "./MessageVariables";
import NeedleConfig from "./NeedleConfig";

export default class InteractionContext {
	public readonly bot: NeedleBot;
	public readonly messages: NeedleConfig["messages"];
	public readonly messageVariables: MessageVariables;

	public get interaction(): NeedleInteraction {
		return this.interactionToReplyTo;
	}

	// TODO: Make private and make replyWithError method instead, and use variables in it
	public get validationError(): string | undefined {
		return this.latestErrorMessage;
	}

	private interactionToReplyTo: NeedleInteraction;
	private latestErrorMessage: string | undefined;

	constructor(bot: NeedleBot, interaction: NeedleInteraction) {
		this.bot = bot;
		this.interactionToReplyTo = interaction;
		this.messages = bot.configs.get(interaction.guildId ?? "").messages;
		this.messageVariables = new MessageVariables().setUser(interaction.user);

		if (!this.isInGuild()) return;
		this.messageVariables.setUser(this.interaction.member).setChannel(this.interaction.channel);
	}

	// TODO: Stop making all these into weird functions unless I really need to (replies would be nice to keep)
	public setInteractionToReplyTo = (interaction: NeedleInteraction | undefined) => {
		if (!interaction) return;
		this.interactionToReplyTo = interaction;
	};

	public replyInSecret = (content: string | undefined): Promise<void> => {
		return this.reply(content, true);
	};

	public replyInPublic = (content: string | undefined): Promise<void> => {
		return this.reply(content, false);
	};

	public isInPublicThread = (): this is ContextWithInteraction<GuildInteraction & PublicThreadInteraction> => {
		if (this.interaction.channel?.type === ChannelType.GuildPublicThread) return true;
		this.latestErrorMessage = this.messages.ERR_ONLY_IN_THREAD;
		return false;
	};

	public isInGuild = (): this is ContextWithInteraction<GuildInteraction> => {
		const { channel } = this.interaction;
		if (channel && !channel?.isDMBased()) return true;
		this.latestErrorMessage = this.messages.ERR_ONLY_IN_SERVER;
		return false;
	};

	public isSlashCommand = (): this is ContextWithInteraction<ChatInputCommandInteraction> => {
		if (this.interaction.isChatInputCommand()) return true;
		this.latestErrorMessage = this.messages.ERR_UNKNOWN;
		return false;
	};

	public isModalSubmit = (): this is ContextWithInteraction<ModalSubmitInteraction> => {
		if (this.interaction.isModalSubmit()) return true;
		this.latestErrorMessage = this.messages.ERR_UNKNOWN;
		return false;
	};

	public isButtonPress = (): this is ContextWithInteraction<ButtonInteraction> => {
		if (this.interaction.isButton()) return true;
		this.latestErrorMessage = this.messages.ERR_UNKNOWN;
		return false;
	};

	// TODO: Implement behavior on what happens if content longer than 2k (pagination or multiple messages?)
	// Should this be some kind of message sender? So we always send messages with the same safe guards
	// Because not everything uses interaction context
	private reply = async (content: string | undefined, ephemeral: boolean): Promise<void> => {
		content = await this.messageVariables.replace(content ?? "");
		if (!content || content.length === 0) {
			console.warn("Tried sending empty message");
			return;
		}

		await this.interaction.reply({ content: content, ephemeral: ephemeral });
	};
}

// TODO: These types can and should be interfaces instead, I think.
export type GuildInteraction = Overwrite<
	NeedleInteraction,
	{ member: GuildMember; guildId: string; channel: GuildTextBasedChannel }
>;
type PublicThreadInteraction = Overwrite<NeedleInteraction, { channel: PublicThreadChannel }>;

type ContextWithInteraction<TInteraction> = Overwrite<InteractionContext, { interaction: TInteraction }>;

// Little type hack with Omit to remove private members from djs types
export type NeedleInteraction = Omit<
	ChatInputCommandInteraction | MessageComponentInteraction | ModalSubmitInteraction,
	""
>;
