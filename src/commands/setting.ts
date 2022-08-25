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
				.setName("setting-name")
				.setDescription("The name of the setting")
				.setRequired(true)
				.setChoices(...choices)
		);
	}

	public async execute(context: InteractionContext): Promise<void> {
		if (!context.isModalOpenable() || !context.isSlashCommand()) return;

		const guildId = context.interaction.guildId;
		const setting = context.interaction.options.getInteger("setting-name", true) as Setting;
		const settingName = Setting[setting] as keyof typeof Setting;
		const autoThreadConfig = this.bot.configs.get(guildId);
		const oldValue = autoThreadConfig.settings[settingName];

		const modal = this.bot.getModal("setting");
		const submitInteraction = await modal.openAndAwaitSubmit(
			context.interaction,
			[{ customId: "setting", value: oldValue }],
			`Setting ${settingName}`
		);

		context.setInteractionToReplyTo(submitInteraction);

		const newValue = submitInteraction.fields.getTextInputValue("setting");
		if (oldValue === newValue) {
			return context.replyInSecret(context.settings.ErrorNoEffect);
		}

		if (newValue.trim().length === 0) {
			return context.replyInSecret("Setting must be at least 1 non-whitespace character.");
		}

		autoThreadConfig.settings[settingName] = newValue;
		this.bot.configs.set(guildId, autoThreadConfig);

		await context.replyInSecret("Setting successfully changed.");
	}
}
