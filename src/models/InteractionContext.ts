// TODO: Make all the imports into types that can be
// TODO: Add license notices
import {
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
import NeedleConfig from "./NeedleConfig";

export default class InteractionContext {
	public readonly bot: NeedleBot;
	public readonly interaction: NeedleInteraction;
	public readonly messages: NeedleConfig["messages"];

	public get validationError(): string | undefined {
		return this.latestErrorMessage;
	}

	private latestErrorMessage: string | undefined;

	constructor(bot: NeedleBot, interaction: NeedleInteraction) {
		this.bot = bot;
		this.interaction = interaction;

		// Actually, we could be cheeky and inject the message variables here, if we had the context!
		// Even more actually, maybe we can construct the context from here? But it would depend on interaction I think.
		this.messages = bot.configs.get(interaction.guildId ?? "").messages;
	}

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

	// TODO: Implement behavior on what happens if content longer than 2k (pagination or multiple messages?)
	// Should this be some kind of message sender? So we always send messages with the same safe guards
	private async reply(content: string | undefined, ephemeral: boolean): Promise<void> {
		if (!content || content.length === 0) {
			console.warn("Tried sending empty message");
			return;
		}

		await this.interaction.reply({ content: content, ephemeral: ephemeral });
	}
}

// TODO: These types can and should be interfaces instead, I think.
type GuildInteraction = Overwrite<
	NeedleInteraction,
	{ member: GuildMember; guildId: string; channel: GuildTextBasedChannel }
>;
type PublicThreadInteraction = Overwrite<NeedleInteraction, { channel: PublicThreadChannel }>;

type ContextWithInteraction<TInteraction> = Overwrite<InteractionContext, { interaction: TInteraction }>;

// Little type hack with Omit to remove private members from djs types
type NeedleInteraction = Omit<ChatInputCommandInteraction | MessageComponentInteraction | ModalSubmitInteraction, "">;
