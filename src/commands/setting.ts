import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { SlashCommandBuilderWithOptions } from "../helpers/typeHelpers";
import CommandCategory from "../models/enums/CommandCategory";
import Setting from "../models/enums/Setting";
import InteractionContext from "../models/InteractionContext";
import NeedleCommand from "../models/NeedleCommand";

export default class SettingCommand extends NeedleCommand {
	public readonly name = "setting";
	public readonly description = "View or change Needle settings for this server";
	public readonly category = CommandCategory.Configuration;
	protected readonly defaultPermissions = PermissionFlagsBits.ManageThreads;

	public addOptions(builder: SlashCommandBuilder): SlashCommandBuilderWithOptions {
		const keys = Object.keys(Setting).filter(v => isNaN(Number(v))) as (keyof typeof Setting)[];
		const choices = keys.map(key => {
			return { name: key, value: Setting[key] };
		});

		return builder.addIntegerOption(option =>
			option
				.setName("name")
				.setDescription("The name of the setting")
				.setRequired(true)
				.setChoices(...choices)
		);
	}

	public async execute(context: InteractionContext): Promise<void> {
		throw new Error("Method not implemented.");
		//  Open modal with text box and then save value
	}
}
