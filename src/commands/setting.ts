import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { SlashCommandBuilderWithOptions } from "../helpers/typeHelpers";
import CommandCategory from "../models/enums/CommandCategory";
import InteractionContext from "../models/InteractionContext";
import NeedleCommand from "../models/NeedleCommand";

export default class SettingCommand extends NeedleCommand {
	public readonly name = "setting";
	public readonly description = "View or change Needle settings for this server";
	public readonly category = CommandCategory.Configuration;
	protected readonly defaultPermissions = PermissionFlagsBits.ManageThreads;

	public addOptions(builder: SlashCommandBuilder): SlashCommandBuilderWithOptions {
		// const choices = [];
		return builder.addIntegerOption(
			option =>
				option
					.setName("name")
					.setDescription("The name of the setting")
					.setRequired(true) /* .setChoices(choices)*/
		);
	}

	public execute(context: InteractionContext): Promise<void> {
		throw new Error("Method not implemented.");
	}
}
