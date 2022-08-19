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
		// TODO: Make some helper function that builds choices out of an enum type (Setting)
		// const choices = [];
		return builder.addIntegerOption(
			option =>
				option
					.setName("name")
					.setDescription("The name of the setting")
					.setRequired(true) /* .setChoices(choices)*/
		);
	}

	public async execute(context: InteractionContext): Promise<void> {
		throw new Error("Method not implemented.");
		//  Open modal with text box and then save value
	}
}
