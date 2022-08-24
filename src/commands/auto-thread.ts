import { ChannelType, GuildMember, GuildTextBasedChannel, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { SlashCommandBuilderWithOptions, SameLengthTuple, Nullish } from "../helpers/typeHelpers";
import AutothreadChannelConfig from "../models/AutothreadChannelConfig";
import CommandCategory from "../models/enums/CommandCategory";
import ReplyMessageOption from "../models/enums/ReplyMessageOption";
import TitleType from "../models/enums/TitleType";
import ToggleOption from "../models/enums/ToggleOption";
import InteractionContext from "../models/InteractionContext";
import NeedleCommand from "../models/NeedleCommand";
import safe_regex from "safe-regex";
import { extractRegex, removeInvalidThreadNameChars } from "../helpers/stringHelpers";
import DeleteBehavior from "../models/enums/DeleteBehavior";
import ReplyButtonsOption from "../models/enums/ReplyButtonsOption";
import { ModalTextInput } from "../models/ModalTextInput";

export default class AutoThreadCommand extends NeedleCommand {
	public readonly name = "auto-thread";
	public readonly description = "Configure automatic creation of threads in a channel";
	public readonly category = CommandCategory.Configuration;
	protected readonly defaultPermissions = PermissionFlagsBits.ManageThreads;

	public async hasPermissionToExecuteHere(
		member: Nullish<GuildMember>,
		channel: Nullish<GuildTextBasedChannel>
	): Promise<boolean> {
		if (channel?.isThread()) return false;
		if (channel?.isVoiceBased()) return false;
		return super.hasPermissionToExecuteHere(member, channel);
	}

	public async execute(context: InteractionContext): Promise<void> {
		if (!context.isInGuild() || !context.isSlashCommand()) return;

		const { interaction, settings, replyInSecret, replyInPublic } = context;
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
		const openReplyButtonsModal = options.getInteger("reply-buttons") === ReplyButtonsOption.Custom;
		const replyType = options.getInteger("reply-message");
		const openReplyMessageModal = replyType === ReplyMessageOption.Custom;

		if (options.getInteger("toggle") === ToggleOption.Off) {
			if (!oldAutoThreadConfig) {
				return replyInSecret(settings.ErrorNoEffect);
			}

			guildConfig.threadChannels.splice(oldConfigIndex, 1);
			this.bot.configs.set(guildId, guildConfig);
			return replyInPublic(`Removed auto-threading in <#${channelId}>`);
		}

		if (+openTitleModal + +openReplyMessageModal + +openReplyButtonsModal > 1) {
			// TODO: Add message key for this
			return replyInSecret('Please set one option to "Custom" at a time.');
		}

		let newCustomTitle;
		let newMaxTitleLength;
		if (openTitleModal) {
			const oldTitle = oldAutoThreadConfig?.customTitle ?? "";
			const oldMaxLength = oldAutoThreadConfig?.titleMaxLength ?? 60;
			let newMaxLengthString;
			[newCustomTitle, newMaxLengthString] = await this.getTextInputsFromModal(
				"custom-title-format",
				[
					{ customId: "title", value: oldTitle },
					{ customId: "maxTitleLength", value: oldMaxLength.toString() },
				],
				context
			);

			// TODO: Message keys below (maybe? if we even do that for config stuff?)

			newMaxTitleLength = Number.parseInt(newMaxLengthString);
			if (Number.isNaN(newMaxTitleLength) || newMaxTitleLength < 1 || newMaxTitleLength > 100) {
				return replyInSecret(newMaxLengthString + " is not a number between 1-100.");
			}

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

		if (options.getInteger("title-format") !== TitleType.Custom) {
			newMaxTitleLength = 50;
		}

		let newReplyMessage;
		if (openReplyMessageModal) {
			const oldReplyType = oldAutoThreadConfig?.replyType;
			const wasUsingDefaultReply = oldReplyType === ReplyMessageOption.Default;
			const oldValue = wasUsingDefaultReply
				? settings.SuccessThreadCreate
				: oldAutoThreadConfig?.customReply ?? "";
			[newReplyMessage] = await this.getTextInputsFromModal(
				"custom-reply-message",
				[{ customId: "message", value: oldValue }],
				context
			);
		}

		if (replyType === ReplyMessageOption.Default) {
			newReplyMessage = "";
		}

		let newCloseButtonText;
		let newCloseButtonStyle;
		let newTitleButtonText;
		let newTitleButtonStyle;
		if (openReplyButtonsModal) {
			// TODO: This default is defined in like 3 places, need to have a default config somewhere probably..
			const oldCloseText = oldAutoThreadConfig?.closeButtonText ?? "Archive thread";
			const oldCloseStyle = oldAutoThreadConfig?.closeButtonStyle ?? "green";
			const oldTitleText = oldAutoThreadConfig?.titleButtonText ?? "Edit title";
			const oldTitleStyle = oldAutoThreadConfig?.titleButtonStyle ?? "blurple";

			[newCloseButtonText, newCloseButtonStyle, newTitleButtonText, newTitleButtonStyle] =
				await this.getTextInputsFromModal(
					"custom-reply-buttons",
					[
						{ customId: "closeText", value: oldCloseText },
						{ customId: "closeStyle", value: oldCloseStyle },
						{ customId: "titleText", value: oldTitleText },
						{ customId: "titleStyle", value: oldTitleStyle },
					],
					context
				);

			if (!this.isValidButtonStyle(newCloseButtonStyle) || !this.isValidButtonStyle(newTitleButtonStyle)) {
				return replyInSecret("Invalid button style. Allowed values: blurple/grey/green/red."); // TODO: Message key
			}
		}

		if (options.getInteger("reply-buttons") === ReplyButtonsOption.Default) {
			newCloseButtonText = "Archive thread";
			newCloseButtonStyle = "green";
			newTitleButtonText = "Edit title";
			newTitleButtonStyle = "blurple";
		}

		const newAutoThreadConfig = new AutothreadChannelConfig(
			oldAutoThreadConfig,
			channelId,
			options.getInteger("delete-behavior"),
			options.getInteger("archive-behavior"),
			options.getInteger("include-bots"),
			options.getInteger("slowmode"),
			options.getInteger("status-reactions"),
			options.getInteger("reply-message"), // TODO: change name to reply-type
			newReplyMessage,
			options.getInteger("title-format"), // TODO: Rename to title-type
			newMaxTitleLength,
			newCustomTitle,
			newCloseButtonText,
			newCloseButtonStyle,
			newTitleButtonText,
			newTitleButtonStyle
		);

		console.dir("NEW:");
		console.dir(newAutoThreadConfig);
		console.dir("OLD:");
		console.dir(oldAutoThreadConfig);

		if (JSON.stringify(oldAutoThreadConfig) === JSON.stringify(newAutoThreadConfig)) {
			return replyInSecret(settings.ErrorNoEffect);
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

	private async getTextInputsFromModal<T extends ModalTextInput[]>(
		modalName: string,
		inputs: [...T],
		context: InteractionContext
	): Promise<SameLengthTuple<T, string>> {
		if (!context.isModalOpenable()) return inputs.map(() => "") as SameLengthTuple<T, string>;

		const customTitleModal = this.bot.getModal(modalName);
		const submitInteraction = await customTitleModal.openAndAwaitSubmit(context.interaction, inputs);
		context.setInteractionToReplyTo(submitInteraction);
		return inputs.map(x => submitInteraction.fields.getTextInputValue(x.customId)) as SameLengthTuple<T, string>;
	}

	// Temporary thing before we get dropdowns in modals
	private isValidButtonStyle(setting: string | undefined): boolean {
		switch (setting?.toLowerCase()) {
			case "blurple":
			case "green":
			case "grey":
			case "red":
				return true;
			default:
				return false;
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
					.setName("title-format")
					.setDescription("How should the thread title look? 🆕🔥")
					.addChoices(
						{ name: "First 50 characters of message (ᴅᴇꜰᴀᴜʟᴛ)", value: TitleType.FirstFiftyChars },
						{ name: "Nickname (yyyy-MM-dd) 🔥", value: TitleType.NicknameDate },
						{ name: "First line of message", value: TitleType.FirstLineOfMessage },
						{ name: "Custom 🔥", value: TitleType.Custom }
					)
			)
			.addIntegerOption(option =>
				option.setName("reply-message").setDescription("How should Needle reply in the thread? 🔥").addChoices(
					{
						name: 'Use "SuccessThreadCreate" setting (ᴅᴇꜰᴀᴜʟᴛ)',
						value: ReplyMessageOption.Default,
					},
					{ name: "Custom message 🔥", value: ReplyMessageOption.Custom }
				)
			)
			.addIntegerOption(option =>
				option
					.setName("reply-buttons")
					.setDescription("What should the buttons of the reply look like? 🆕")
					.addChoices(
						{
							name: "Green archive button, Blurple edit button (ᴅᴇꜰᴀᴜʟᴛ)",
							value: ReplyButtonsOption.Default,
						},
						{ name: "Custom 🔥", value: ReplyButtonsOption.Custom }
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
					.setName("delete-behavior")
					.setDescription("What should happen to the thread if the start message is deleted? 🆕")
					.addChoices(
						{
							name: "Delete if thread is empty, otherwise archive (ᴅᴇꜰᴀᴜʟᴛ)",
							value: DeleteBehavior.DeleteIfEmptyElseArchive,
						},
						{ name: "Always archive", value: DeleteBehavior.Archive },
						{ name: "Always delete ❗", value: DeleteBehavior.Delete },
						{ name: "Do nothing", value: DeleteBehavior.Nothing }
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
