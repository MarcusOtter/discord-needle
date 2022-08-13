import {
	ActionRowBuilder,
	ChannelType,
	ChatInputCommandInteraction,
	ModalActionRowComponentBuilder,
	ModalBuilder,
	PermissionFlagsBits,
	SlashCommandBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";
import { SlashCommandBuilderWithOptions } from "../helpers/typeHelpers";
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

	public async execute(context: InteractionContext): Promise<void> {
		if (!context.isInGuild() || !context.isSlashCommand()) {
			return context.replyInSecret(context.validationError);
		}

		const { interaction, messages, replyInSecret, replyInPublic } = context;
		const { guildId, channel, options, member } = interaction;

		// TODO: Handle channel visibility error if bot cannot see
		// TODO: Handle error if bot cannot create threads in this channel
		// TODO: Handle error if we try to set slowmode but bot does not have manage threads perm

		// TODO: Handle error if channel is not a channel that can be auto-threaded, like a thread or text voice chat

		const channelId = options.getChannel("channel")?.id ?? channel.id;
		const guildConfig = this.bot.configs.get(guildId);
		const oldConfigIndex = guildConfig.threadChannels.findIndex(c => c.channelId === channelId);
		const oldAutoThreadConfig = oldConfigIndex > -1 ? guildConfig.threadChannels[oldConfigIndex] : undefined;
		const removeAutoThreading = options.getInteger("toggle") === ToggleOption.Off;
		const newTitleFormat = options.getString("title-format");
		const openNewTitleModal = newTitleFormat === "custom" && newTitleFormat !== oldAutoThreadConfig?.titleFormat;

		if (removeAutoThreading) {
			if (!oldAutoThreadConfig) {
				return replyInSecret(messages.ERR_NO_EFFECT);
			}

			guildConfig.threadChannels.splice(oldConfigIndex, 1);
			this.bot.configs.set(guildId, guildConfig);
			return replyInPublic(`Removed auto-threading in <#${channel.id}>`);
		}

		// TODO: Check if we have 2 custom options (title AND custom-message), and if so, error out with new error
		// Do it one at a time if u want both custom

		let newCustomTitleFormat;
		if (openNewTitleModal) {
			// TODO: Just have one title format and make the options in actual regexes
			newCustomTitleFormat = await this.getCustomTitleFormat(interaction);
		}

		// TODO: The boolean things have bugs here, can never be undefined right
		// Maybe constructor should take the string value and convert it to a boolean
		// This would also look less messy if we also provided the old thread config in the ctor

		// TODO: Okay apparently the whole thing is bugged, it still overwrites for some reason...
		const newAutoThreadConfig = new AutothreadChannelConfig(
			oldAutoThreadConfig,
			channelId,
			options.getInteger("archive-behavior"),
			options.getString("custom-message"),
			options.getInteger("include-bots"),
			options.getInteger("slowmode"),
			newCustomTitleFormat,
			options.getInteger("status-reactions")
		);

		console.dir("NEW:");
		console.dir(newAutoThreadConfig);
		console.dir("OLD:");
		console.dir(oldAutoThreadConfig);

		if (JSON.stringify(oldAutoThreadConfig) === JSON.stringify(newAutoThreadConfig)) {
			return replyInSecret(messages.ERR_NO_EFFECT);
		}

		if (oldConfigIndex > -1) {
			guildConfig.threadChannels[oldConfigIndex] = newAutoThreadConfig;
		} else {
			guildConfig.threadChannels.push(newAutoThreadConfig);
		}

		this.bot.configs.set(guildId, guildConfig);
		// TODO: Fix bug with success_thread_create
		// TODO: If custom format and empty custom title format, do default format instead

		// TODO: Make public when done
		if (!openNewTitleModal) {
			replyInSecret("It might have worked...");
		}
	}

	private async getCustomTitleFormat(interaction: GuildInteraction & ChatInputCommandInteraction): Promise<string> {
		// TODO: Add more instructions to this modal
		const modal = new ModalBuilder().setCustomId("custom-title").setTitle("Set a custom title format");
		const titleInput = new TextInputBuilder()
			.setCustomId("title")
			.setLabel("Title format")
			.setRequired(true)
			.setPlaceholder("Help $USER with /\\w*a\\w*/gi")
			.setStyle(TextInputStyle.Short);
		const row = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(titleInput);
		modal.addComponents(row);

		await interaction.showModal(modal);
		const submitInteraction = await interaction.awaitModalSubmit({
			time: 1000 * 60 * 15, // 15 min
			filter: x => x.customId === "custom-title" && x.user.id === interaction.user.id,
		});

		const title = submitInteraction.fields.getTextInputValue("title");
		// TODO: Put this reply somewhere else because we need to know if it's successful first
		await submitInteraction.reply({ content: `New custom title: \`${title}\``, ephemeral: true });
		return title;
	}

	// TODO: What if.. instead of string options, we do enums? MUCH easier to work with...
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
