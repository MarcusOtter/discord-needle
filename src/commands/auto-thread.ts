import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { Nullish, SlashCommandBuilderWithOptions } from "../helpers/typeHelpers";
import AutothreadChannelConfig from "../models/AutothreadChannelConfig";
import CommandCategory from "../models/enums/CommandCategory";
import ReplyType from "../models/enums/ReplyType";
import TitleType from "../models/enums/TitleFormat";
import ToggleOption from "../models/enums/ToggleOption";
import InteractionContext from "../models/InteractionContext";
import NeedleCommand from "../models/NeedleCommand";
import { ModalOpenableInteraction } from "../models/NeedleModal";
import safe_regex from "safe-regex";
import { extractRegex, removeInvalidThreadNameChars } from "../helpers/stringHelpers";

export default class AutoThreadCommand extends NeedleCommand {
	public readonly name = "auto-thread";
	public readonly description = "Configure automatic creation of threads in a channel";
	public readonly category = CommandCategory.Configuration;
	public readonly permissions = PermissionFlagsBits.ManageThreads;

	public async execute(context: InteractionContext): Promise<void> {
		if (!context.isInGuild() || !context.isSlashCommand()) {
			return context.replyInSecret(context.validationError);
		}

		const { interaction, messages, replyInSecret, replyInPublic } = context;
		const { guildId, options } = interaction;

		// TODO: Handle channel visibility error if bot cannot see
		// TODO: Handle error if bot cannot create threads in this channel
		// TODO: Handle error if we try to set slowmode but bot does not have manage threads perm

		// TODO: Handle error if channel is not a channel that can be auto-threaded, like a thread or text voice chat
		const channelId = options.getChannel("channel")?.id ?? interaction.channel.id;
		const guildConfig = this.bot.configs.get(guildId);
		const oldConfigIndex = guildConfig.threadChannels.findIndex(c => c.channelId === channelId);
		const oldAutoThreadConfig = oldConfigIndex > -1 ? guildConfig.threadChannels[oldConfigIndex] : undefined;
		const openTitleModal = options.getInteger("title-format") === TitleType.Custom;
		const replyType = options.getInteger("reply-message");
		const openReplyMessageModal =
			replyType === ReplyType.CustomWithButtons || replyType === ReplyType.CustomWithoutButtons;

		if (options.getInteger("toggle") === ToggleOption.Off) {
			if (!oldAutoThreadConfig) {
				return replyInSecret(messages.ERR_NO_EFFECT);
			}

			guildConfig.threadChannels.splice(oldConfigIndex, 1);
			this.bot.configs.set(guildId, guildConfig);
			return replyInPublic(`Removed auto-threading in <#${channelId}>`);
		}

		if (openTitleModal && openReplyMessageModal) {
			// TODO: Add message key for this
			return replyInSecret(
				"If you want to set both a custom title and custom reply message, please do it one at a time."
			);
		}

		let newCustomTitle;
		if (openTitleModal) {
			const oldValue = oldAutoThreadConfig?.customTitle ?? "";
			newCustomTitle = await this.getTextInputFromModal(
				"custom-title-format",
				"title",
				oldValue,
				interaction,
				context
			);

			// TODO: Message keys below

			const hasMoreThanTwoSlashes = newCustomTitle.split("/").length - 1 > 2;
			if (hasMoreThanTwoSlashes) {
				return replyInSecret("Custom titles can not have more than one regex.");
			}

			const { inputWithRegexVariable, regex } = extractRegex(newCustomTitle);
			if (regex && !safe_regex(regex)) {
				return replyInSecret("Unsafe regex detected, please try again with a safe regex.");
			}

			if (removeInvalidThreadNameChars(inputWithRegexVariable).length === 0) {
				return replyInSecret("Invalid title, please provide at least one valid character.");
			}
		}

		let newCustomReply;
		if (openReplyMessageModal) {
			const oldReplyType = oldAutoThreadConfig?.replyType;
			const wasUsingDefaultReply =
				oldReplyType === ReplyType.DefaultWithButtons || oldReplyType === ReplyType.DefaultWithoutButtons;
			const oldValue = wasUsingDefaultReply
				? messages.SUCCESS_THREAD_CREATE
				: oldAutoThreadConfig?.customReply ?? "";
			newCustomReply = await this.getTextInputFromModal(
				"custom-reply-message",
				"message",
				oldValue,
				interaction,
				context
			);

			if (newCustomReply.trim().length === 0) {
				return replyInSecret("Invalid reply message, please provide at least one valid character.");
			}
		}

		const newAutoThreadConfig = new AutothreadChannelConfig(
			oldAutoThreadConfig,
			channelId,
			options.getInteger("archive-behavior"),
			options.getInteger("include-bots"),
			options.getInteger("slowmode"),
			options.getInteger("status-reactions"),
			options.getInteger("reply-message"), // TODO: change name to reply-type
			newCustomReply,
			options.getInteger("title-format"), // TODO: Rename to title-type
			newCustomTitle
		);

		console.dir("NEW:");
		console.dir(newAutoThreadConfig);
		console.dir("OLD:");
		console.dir(oldAutoThreadConfig);

		if (JSON.stringify(oldAutoThreadConfig) === JSON.stringify(newAutoThreadConfig)) {
			return replyInSecret(messages.ERR_NO_EFFECT);
		}

		let interactionReplyMessage;
		if (oldConfigIndex > -1) {
			interactionReplyMessage = `Updated settings for auto-threading in <#${channelId}>`;
			guildConfig.threadChannels[oldConfigIndex] = newAutoThreadConfig;
		} else {
			interactionReplyMessage = `Enabled auto-threading in <#${channelId}>`;
			guildConfig.threadChannels.push(newAutoThreadConfig);
		}

		this.bot.configs.set(guildId, guildConfig);

		// TODO: Make public when done
		return replyInSecret(interactionReplyMessage);
	}

	private async getTextInputFromModal(
		modalName: string,
		inputCustomId: string,
		currentValue: Nullish<string>,
		interaction: ModalOpenableInteraction,
		context: InteractionContext
	): Promise<string> {
		const customTitleModal = this.bot.getModal(modalName);
		const submitInteraction = await customTitleModal.openAndAwaitSubmit(interaction, currentValue);
		context.setInteractionToReplyTo(submitInteraction);
		return submitInteraction.fields.getTextInputValue(inputCustomId);
	}

	public addOptions(builder: SlashCommandBuilder): SlashCommandBuilderWithOptions {
		return builder
			.addChannelOption(option =>
				option
					.setName("channel")
					.setDescription("Which channel? Current channel by default.")
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
						{ name: "Default message with buttons (ᴅᴇꜰᴀᴜʟᴛ)", value: ReplyType.DefaultWithButtons },
						{ name: "Default message without buttons", value: ReplyType.DefaultWithoutButtons },
						{ name: "Only buttons, no message", value: ReplyType.NothingWithButtons },
						{ name: "No reply at all, just create the thread 🔥", value: ReplyType.NothingWithoutButtons },
						{ name: "Custom message with buttons 🔥", value: ReplyType.CustomWithButtons },
						{ name: "Custom message without buttons", value: ReplyType.CustomWithoutButtons }
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
					.setDescription("How should the thread title look? 🆕🔥")
					.addChoices(
						{ name: "First 40 characters of message (ᴅᴇꜰᴀᴜʟᴛ)", value: TitleType.FirstFourtyChars },
						{ name: "Nickname (yyyy-MM-dd) 🔥", value: TitleType.NicknameDate },
						{ name: "First line of message", value: TitleType.FirstLineOfMessage },
						{ name: "Custom 🔥", value: TitleType.Custom }
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
