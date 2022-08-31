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

import {
	ChannelType,
	type GuildMember,
	type GuildTextBasedChannel,
	PermissionFlagsBits,
	type SlashCommandBuilder,
} from "discord.js";
import type { SlashCommandBuilderWithOptions, SameLengthTuple, Nullish } from "../helpers/typeHelpers.js";
import AutothreadChannelConfig from "../models/AutothreadChannelConfig.js";
import CommandCategory from "../models/enums/CommandCategory.js";
import ReplyMessageOption from "../models/enums/ReplyMessageOption.js";
import TitleType from "../models/enums/TitleType.js";
import ToggleOption from "../models/enums/ToggleOption.js";
import type InteractionContext from "../models/InteractionContext.js";
import NeedleCommand from "../models/NeedleCommand.js";
import safe_regex from "safe-regex";
import { extractRegex, removeInvalidThreadNameChars } from "../helpers/stringHelpers.js";
import DeleteBehavior from "../models/enums/DeleteBehavior.js";
import ReplyButtonsOption from "../models/enums/ReplyButtonsOption.js";
import type { ModalTextInput } from "../models/ModalTextInput.js";

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
		const { guild, guildId, options } = interaction;
		const channelId = options.getChannel("channel")?.id ?? interaction.channel.id;
		const targetChannel = await guild?.channels.fetch(channelId);

		if (!targetChannel) return;

		const botMember = await guild?.members.fetchMe();
		const botPermissions = botMember?.permissionsIn(targetChannel);

		if (!botPermissions?.has(PermissionFlagsBits.ViewChannel)) {
			return replyInSecret("Needle does not have permission to see this channel");
		}

		if (!botPermissions.has(PermissionFlagsBits.CreatePublicThreads)) {
			return replyInSecret("Needle does not have permission to create threads in this channel");
		}

		if ((options.getInteger("slowmode") ?? 0) > 0 && !botPermissions?.has(PermissionFlagsBits.ManageThreads)) {
			return replyInSecret('Needle needs the "Manage Threads" permission to set a slowmode in the thread');
		}

		if (options.getInteger("status-reactions") && !botPermissions?.has(PermissionFlagsBits.AddReactions)) {
			return replyInSecret('Needle needs the "Add Reactions" permission to add reactions to messages');
		}

		const guildConfig = this.bot.configs.get(guildId);
		const oldConfigIndex = guildConfig.threadChannels.findIndex(c => c.channelId === channelId);
		const oldAutoThreadConfig = oldConfigIndex > -1 ? guildConfig.threadChannels[oldConfigIndex] : undefined;
		const openTitleModal = options.getInteger("title-format") === TitleType.Custom;
		const openReplyButtonsModal = options.getInteger("reply-buttons") === ReplyButtonsOption.Custom;
		const replyType = options.getInteger("reply-message");
		const openReplyMessageModal = replyType === ReplyMessageOption.Custom;

		if (targetChannel?.isThread() || targetChannel?.isVoiceBased()) {
			return replyInSecret("Can not create threads in this type of channel.");
		}

		if (options.getInteger("toggle") === ToggleOption.Off) {
			if (!oldAutoThreadConfig) {
				return replyInSecret(settings.ErrorNoEffect);
			}

			guildConfig.threadChannels.splice(oldConfigIndex, 1);
			this.bot.configs.set(guildId, guildConfig);
			return replyInPublic(`Removed auto-threading in <#${channelId}>`);
		}

		if (+openTitleModal + +openReplyMessageModal + +openReplyButtonsModal > 1) {
			return replyInSecret('Please set one option to "Custom" at a time.');
		}

		let newCustomTitle;
		let newMaxTitleLength;
		let newRegexJoinText;
		if (openTitleModal) {
			const oldTitle = oldAutoThreadConfig?.customTitle ?? "/^[\\S\\s]/g";
			const oldMaxLength = oldAutoThreadConfig?.titleMaxLength ?? 50;
			const oldJoinText = oldAutoThreadConfig?.regexJoinText ?? "";
			let newMaxLengthString;
			[newCustomTitle, newMaxLengthString, newRegexJoinText] = await this.getTextInputsFromModal(
				"custom-title-format",
				[
					{ customId: "title", value: oldTitle },
					{ customId: "maxTitleLength", value: oldMaxLength.toString() },
					{ customId: "regexJoinText", value: oldJoinText },
				],
				context
			);

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
				? settings.SuccessThreadCreated
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
				return replyInSecret("Invalid button style. Allowed values: blurple/grey/green/red.");
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
			options.getInteger("reply-message"),
			newReplyMessage,
			options.getInteger("title-format"),
			newMaxTitleLength,
			newRegexJoinText,
			newCustomTitle,
			newCloseButtonText,
			newCloseButtonStyle,
			newTitleButtonText,
			newTitleButtonStyle
		);

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
		return replyInPublic(interactionReplyMessage);
	}

	private async getTextInputsFromModal<T extends ModalTextInput[]>(
		modalName: string,
		inputs: T,
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
						{ name: "Hide after 1 hour of inactivity", value: ToggleOption.Off }
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
