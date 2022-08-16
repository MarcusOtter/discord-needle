import {
	ChannelType,
	ChatInputCommandInteraction,
	ModalSubmitInteraction,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from "discord.js";
import { SlashCommandBuilderWithOptions } from "../helpers/typeHelpers";
import AutothreadChannelConfig from "../models/AutothreadChannelConfig";
import CommandCategory from "../models/enums/CommandCategory";
import CommandTag from "../models/enums/CommandTag";
import ReplyType from "../models/enums/ReplyType";
import TitleType from "../models/enums/TitleFormat";
import ToggleOption from "../models/enums/ToggleOption";
import InteractionContext from "../models/InteractionContext";
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
		const openTitleModal = options.getInteger("title-format") === TitleType.Custom;
		const replyMessageOption = options.getInteger("reply-message");
		const openReplyMessageModal =
			replyMessageOption === ReplyType.CustomWithButtons || replyMessageOption === ReplyType.CustomWithoutButtons;

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
		// TODO: Refactor and fix, now we are throwing away the modal submit interaction
		// We should make it into its own function, can maybe be used by custom message as well
		// Also TODO: Throw error if more than 2 slashes because our regex parser cannot handle that
		// IMPORTANT TODO: Use safe-regex to make sure the regex we received is safe, code for extraction is in messageCreate atm
		let newCustomTitle;
		if (openTitleModal) {
			const customTitleModal = this.bot.getModal("custom-title-format");
			const customTitleInteraction = await customTitleModal?.openAndAwaitSubmit(interaction);
			newCustomTitle = customTitleInteraction?.fields.getTextInputValue("title");
		}

		const newAutoThreadConfig = new AutothreadChannelConfig(
			oldAutoThreadConfig,
			channelId,
			options.getInteger("archive-behavior"),
			options.getInteger("reply-message"), // TODO: change name
			"", // wrong, get the actual reply message from modal if needed
			options.getInteger("include-bots"),
			options.getInteger("slowmode"),
			options.getInteger("status-reactions"),
			options.getInteger("title-format"), // TODO: Rename to title-type
			newCustomTitle
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
						{ name: "Let Discord decide", value: TitleType.DiscordDefault },
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
