import {
	ActionRowBuilder,
	ChannelType,
	ChatInputCommandInteraction,
	ModalActionRowComponentBuilder,
	ModalBuilder,
	ModalSubmitInteraction,
	PermissionFlagsBits,
	SlashCommandBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";
import { Nullish, SlashCommandBuilderWithOptions } from "../helpers/typeHelpers";
import AutothreadChannelConfig from "../models/AutothreadChannelConfig";
import CommandCategory from "../models/enums/CommandCategory";
import CommandTag from "../models/enums/CommandTag";
import InteractionContext, { GuildInteraction } from "../models/InteractionContext";
import NeedleCommand from "../models/NeedleCommand";

export default class AutoThreadCommand extends NeedleCommand {
	public readonly name = "auto-thread";
	public readonly description = "Configure automatic creation of threads in a channel";
	public readonly category = CommandCategory.Configuration;
	public readonly tags = [CommandTag.Popular, CommandTag.RequiresSpecialPermissions];
	public readonly permissions = PermissionFlagsBits.ManageThreads;

	private interactionToReplyTo: ChatInputCommandInteraction | ModalSubmitInteraction | undefined;

	public async execute(context: InteractionContext): Promise<void> {
		if (!context.isInGuild() || !context.isSlashCommand()) {
			return context.replyInSecret(context.validationError);
		}

		const { interaction, messages, replyInSecret, replyInPublic } = context;
		const { guildId, channel, options, member } = interaction;
		this.interactionToReplyTo = interaction;

		// TODO: Handle channel visibility error if bot cannot see
		// TODO: Handle error if bot cannot create threads in this channel
		// TODO: Handle error if we try to set slowmode but bot does not have manage threads perm

		// TODO: Handle error if channel is not a channel that can be auto-threaded, like a thread or text voice chat

		const channelId = options.getChannel("channel")?.id ?? channel.id;
		const guildConfig = this.bot.configs.get(guildId);
		const oldConfigIndex = guildConfig.threadChannels.findIndex(c => c.channelId === channelId);
		const oldAutoThreadConfig = oldConfigIndex > -1 ? guildConfig.threadChannels[oldConfigIndex] : undefined;
		const openTitleModal = options.getInteger("title-format") === TitleFormat.Custom;
		const replyMessageOption = options.getInteger("reply-message");
		const openReplyMessageModal =
			replyMessageOption === ReplyMessage.CustomWithButtons ||
			replyMessageOption === ReplyMessage.CustomWithoutButtons;

		if (options.getInteger("toggle") === ToggleOption.Off) {
			if (!oldAutoThreadConfig) {
				return replyInSecret(messages.ERR_NO_EFFECT);
			}

			guildConfig.threadChannels.splice(oldConfigIndex, 1);
			this.bot.configs.set(guildId, guildConfig);
			return replyInPublic(`Removed auto-threading in <#${channel.id}>`);
		}

		if (openTitleModal && openReplyMessageModal) {
			// TODO: Add message key for this
			return replyInSecret(
				"If you want to set both a custom title and custom reply message, please do it one at a time"
			);
		}

		// Use interactionToReplyTo after this point
		const newTitleFormat = openTitleModal
			? await this.getCustomTitleFormat(interaction)
			: this.getTitleRegex(options.getInteger("title-format"));

		const newAutoThreadConfig = new AutothreadChannelConfig(
			oldAutoThreadConfig,
			channelId,
			options.getInteger("archive-behavior"),
			newTitleFormat,
			options.getInteger("include-bots"),
			options.getInteger("slowmode"),
			newTitleFormat,
			options.getInteger("status-reactions")
		);

		console.dir("NEW:");
		console.dir(newAutoThreadConfig);
		console.dir("OLD:");
		console.dir(oldAutoThreadConfig);

		if (JSON.stringify(oldAutoThreadConfig) === JSON.stringify(newAutoThreadConfig)) {
			return replyInSecret(messages.ERR_NO_EFFECT, this.interactionToReplyTo);
		}

		if (oldConfigIndex > -1) {
			guildConfig.threadChannels[oldConfigIndex] = newAutoThreadConfig;
		} else {
			guildConfig.threadChannels.push(newAutoThreadConfig);
		}

		this.bot.configs.set(guildId, guildConfig);
		// TODO: Fix bug with success_thread_create (if empty msg I think we should use that instead)
		// TODO: If custom format and empty title format, do default format instead

		// TODO: Make public when done
		// Make different for enable autothread, disable, and update settings
		if (!openTitleModal) {
			return replyInSecret("It might have worked...", this.interactionToReplyTo);
		}
	}

	private async getCustomTitleFormat(interaction: GuildInteraction & ChatInputCommandInteraction): Promise<string> {
		// TODO: Add more instructions to this modal
		const modal = new ModalBuilder().setCustomId("custom-title").setTitle("Set a custom title format");
		const titleInput = new TextInputBuilder()
			.setCustomId("title")
			.setLabel("Title format")
			.setRequired(true)
			.setPlaceholder("$USER help: /^(.*)$/m")
			.setStyle(TextInputStyle.Short);
		const row = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(titleInput);
		modal.addComponents(row);

		await interaction.showModal(modal);
		const submitInteraction = await interaction.awaitModalSubmit({
			time: 1000 * 60 * 15, // 15 min
			filter: x => x.customId === "custom-title" && x.user.id === interaction.user.id,
		});

		this.interactionToReplyTo = submitInteraction;
		return submitInteraction.fields.getTextInputValue("title");
	}

	// TODO: I think I need to split this up again to 2 values for reply message....
	// TODO: Maybe make this stuff generic because I copy pasted from above
	// TODO: If this returns nullish then it should be empty string I think lol nice job
	private async getCustomReplyMessage(
		interaction: GuildInteraction & ChatInputCommandInteraction
	): Promise<Nullish<string>> {
		const modal = new ModalBuilder().setCustomId("reply-message-modal").setTitle("Set a custom reply message");
		const messageInput = new TextInputBuilder()
			.setCustomId("message")
			.setLabel("Custom message")
			.setRequired(false)
			.setPlaceholder("Thread automatically created by $USER in $CHANNEL.")
			.setStyle(TextInputStyle.Paragraph);
		const row = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(messageInput);
		modal.addComponents(row);

		await interaction.showModal(modal);
		const submitInteraction = await interaction.awaitModalSubmit({
			time: 1000 * 60 * 15, // 15 min
			filter: x => x.customId === "reply-message-modal" && x.user.id === interaction.user.id,
		});

		this.interactionToReplyTo = submitInteraction;
		return submitInteraction.fields.getTextInputValue("message");
	}

	private getTitleRegex(formatOption: Nullish<TitleFormat>): string | undefined {
		if (formatOption === undefined || formatOption === null) return undefined;
		switch (formatOption) {
			case TitleFormat.FirstLineOfMessage:
				return "/^(.*)$/m";
			case TitleFormat.FirstThirtyChars:
				return "/^((.|\\s){0,30})/ig";
			case TitleFormat.NicknameDate:
				return "$USER ($DATE)";

			default:
			case TitleFormat.DiscordDefault:
			case TitleFormat.Custom:
				return "";
		}
	}

	public addOptions(builder: SlashCommandBuilder): SlashCommandBuilderWithOptions {
		return builder
			.addChannelOption(option =>
				option
					.setName("channel")
					.setDescription("Which channel? Current channel by default.")
					// TODO: Add category
					.addChannelTypes(ChannelType.GuildText, ChannelType.GuildNews)
			)
			.addIntegerOption(option =>
				option
					.setName("toggle")
					.setDescription("Should auto-threading be turned on or off?")
					.addChoices(
						{ name: "Auto-threading ON (ᴅᴇꜰᴀᴜʟᴛ)", value: ToggleOption.On },
						{ name: "Auto-threading OFF", value: ToggleOption.Off }
					)
			)
			.addIntegerOption(option =>
				option
					.setName("reply-message")
					.setDescription("How should Needle reply in the thread? 🔥")
					.addChoices(
						{ name: "Default message with buttons (ᴅᴇꜰᴀᴜʟᴛ)", value: ReplyMessage.DefaultWithButtons },
						{ name: "Default message without buttons", value: ReplyMessage.DefaultWithoutButtons },
						{ name: "Only buttons, no message", value: ReplyMessage.NothingWithButtons },
						{ name: "No reply at all, just create the thread", value: ReplyMessage.NothingWithoutButtons },
						{ name: "Custom message with buttons 🔥", value: ReplyMessage.CustomWithButtons },
						{ name: "Custom message without buttons", value: ReplyMessage.CustomWithoutButtons }
					)
			)
			.addIntegerOption(option =>
				option
					.setName("include-bots")
					.setDescription("Should threads be created on bot messages?")
					.addChoices(
						{ name: "Exclude bots (ᴅᴇꜰᴀᴜʟᴛ)", value: ToggleOption.Off },
						{ name: "Include bots", value: ToggleOption.On }
					)
			)
			.addIntegerOption(option =>
				option
					.setName("archive-behavior")
					.setDescription("What should happen when users close a thread?")
					.addChoices(
						{ name: "Archive immediately (ᴅᴇꜰᴀᴜʟᴛ)", value: ToggleOption.On },
						{ name: "Archive after 1 hour of inactivity", value: ToggleOption.Off }
					)
			)
			.addIntegerOption(option =>
				option
					.setName("title-format")
					.setDescription("How should the thread title look? 🆕")
					.addChoices(
						{ name: "Let Discord decide (ᴅᴇꜰᴀᴜʟᴛ)", value: TitleFormat.DiscordDefault },
						{ name: "Nickname (yyyy-MM-dd)", value: TitleFormat.NicknameDate },
						{ name: "First 30 characters of message", value: TitleFormat.FirstThirtyChars },
						{ name: "First line of message", value: TitleFormat.FirstLineOfMessage },
						{ name: "Custom", value: TitleFormat.Custom }
					)
			)
			.addIntegerOption(option =>
				option
					.setName("status-reactions")
					.setDescription("Should thread statuses be shown with emoji reactions? 🆕")
					.addChoices(
						{ name: "Reactions OFF (ᴅᴇꜰᴀᴜʟᴛ)", value: ToggleOption.Off },
						{ name: "Reactions ON", value: ToggleOption.On }
					)
			)
			.addIntegerOption(option =>
				option
					.setName("slowmode")
					.setDescription("How long should the slowmode be in created threads?")
					.addChoices(
						{ name: "Off (ᴅᴇꜰᴀᴜʟᴛ)", value: 0 },
						{ name: "5 seconds", value: 5 },
						{ name: "30 seconds", value: 30 },
						{ name: "1 minute", value: 60 },
						{ name: "5 minutes", value: 300 },
						{ name: "15 minutes", value: 900 },
						{ name: "1 hour", value: 3600 },
						{ name: "6 hours", value: 21600 }
					)
			);
	}
}

export enum ToggleOption {
	Off = 0,
	On = 1,
}

enum TitleFormat {
	DiscordDefault = 0,
	NicknameDate,
	FirstThirtyChars,
	FirstLineOfMessage,
	Custom,
}

enum ReplyMessage {
	DefaultWithButtons = 0,
	DefaultWithoutButtons,
	NothingWithButtons,
	NothingWithoutButtons,
	CustomWithButtons,
	CustomWithoutButtons,
}
