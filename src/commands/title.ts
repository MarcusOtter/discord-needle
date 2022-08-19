import { ChannelType, GuildMember, GuildTextBasedChannel, SlashCommandBuilder } from "discord.js";
import { isAllowedToChangeThreadTitle } from "../helpers/permissionsHelpers";
import { SlashCommandBuilderWithOptions } from "../helpers/typeHelpers";
import CommandCategory from "../models/enums/CommandCategory";
import InteractionContext from "../models/InteractionContext";
import NeedleCommand from "../models/NeedleCommand";

export default class TitleCommand extends NeedleCommand {
	public readonly name = "title";
	public readonly description = "Change the title of a thread";
	public readonly category = CommandCategory.ThreadOnly;

	public addOptions(builder: SlashCommandBuilder): SlashCommandBuilderWithOptions {
		return builder.addStringOption(option =>
			option.setName("value").setDescription("The new title of the thread").setRequired(true)
		);
	}

	public async hasPermissionToExecuteHere(member: GuildMember, channel: GuildTextBasedChannel): Promise<boolean> {
		const hasBasePermissions = await super.hasPermissionToExecuteHere(member, channel);
		if (!hasBasePermissions) return false;

		if (channel.type !== ChannelType.GuildPublicThread) return false;
		return isAllowedToChangeThreadTitle(channel, member);
	}

	public async execute(context: InteractionContext): Promise<void> {
		const { settings, replyInSecret } = context;
		if (!context.isInPublicThread()) {
			return replyInSecret(context.validationError);
		}

		const { channel, member } = context.interaction;

		let newThreadName = "";
		if (context.isSlashCommand()) {
			newThreadName = context.interaction.options.getString("value", true);
		} else if (context.isButtonPress()) {
			newThreadName = "TODO: GETT FROM MODAL";
		}

		const userHasPermission = await isAllowedToChangeThreadTitle(channel, member);
		const botHasPermission = await isAllowedToChangeThreadTitle(channel, channel.guild.members.me);

		if (!userHasPermission) return replyInSecret(settings.ErrorInsufficientUserPerms);
		if (!botHasPermission) return replyInSecret(settings.ErrorInsufficientBotPerms); // TODO: make sure it works (untested)
		if (channel.name === newThreadName) return replyInSecret(settings.ErrorNoEffect);

		await channel.setName(newThreadName);
		await replyInSecret("Success!"); // TODO: Remove pointless success (edit interaction instead or smthn)
	}
}
