import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { SlashCommandBuilderWithOptions } from "../helpers/typeHelpers";
import CommandCategory from "../models/enums/CommandCategory";
import CommandTag from "../models/enums/CommandTag";
import InteractionContext from "../models/InteractionContext";
import NeedleCommand from "../models/NeedleCommand";

export default class AutoThreadCommand extends NeedleCommand {
	public readonly name = "auto-thread";
	public readonly description = "Configure automatic creation of threads in a channel";
	public readonly category = CommandCategory.Configuration;
	public readonly tags = [CommandTag.Popular, CommandTag.RequiresSpecialPermissions];
	public readonly permissions = PermissionFlagsBits.ManageThreads;

	public execute(context: InteractionContext): Promise<void> {
		// TODO: Check if unauthorized people can invoke this even if default perms are higher
		throw new Error("Method not implemented.");
	}

	public addOptions(builder: SlashCommandBuilder): SlashCommandBuilderWithOptions {
		return builder
			.addChannelOption(option =>
				option
					.setName("channel")
					.setDescription("Which channel? Current channel by default.")
					.addChannelTypes(ChannelType.GuildText, ChannelType.GuildNews) // TODO: Add category
					.setRequired(false)
			)
			.addStringOption(option =>
				option
					.setName("toggle")
					.setDescription("Should auto-threading be turned on or off?")
					.addChoices(
						{ name: "Auto-threading ON (ᴅᴇꜰᴀᴜʟᴛ)", value: "on" },
						{ name: "Auto-threading OFF", value: "off" }
					)
			)
			.addStringOption(option =>
				option
					.setName("include-bots")
					.setDescription("Should threads be created on bot messages?")
					.addChoices({ name: "Exclude bots (ᴅᴇꜰᴀᴜʟᴛ)", value: "off" }, { name: "Include bots", value: "on" })
			)
			.addStringOption(option =>
				option
					.setName("archive-behavior")
					.setDescription("What should happen when users close a thread?")
					.addChoices(
						{ name: "Archive immediately (ᴅᴇꜰᴀᴜʟᴛ)", value: "immediately" },
						{ name: "Archive after 1 hour of inactivity", value: "slow" }
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
			)
			.addStringOption(option =>
				option
					.setName("title-format")
					.setDescription("How should the thread title look?")
					.addChoices(
						{ name: "Let Discord decide (ᴅᴇꜰᴀᴜʟᴛ)", value: "discordDefault" },
						{ name: "Nickname (yyyy-MM-dd)", value: "usernameDate" },
						{ name: "First 30 characters of message", value: "firstThirtyChars" },
						{ name: "First line of message", value: "firstLine" },
						{ name: "Custom", value: "custom" }
					)
			)
			.addStringOption(option =>
				option
					.setName("status-reactions")
					.setDescription("Should thread statuses be shown with emoji reactions?")
					.addChoices(
						{ name: "Reactions OFF (ᴅᴇꜰᴀᴜʟᴛ)", value: "off" },
						{ name: "Reactions ON", value: "on" }
					)
			)
			.addStringOption(option =>
				option
					.setName("custom-message")
					.setDescription('What should Needle say to users? Use "\\n" for new line.')
			);
	}
}
