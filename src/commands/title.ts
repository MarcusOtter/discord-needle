import { SlashCommandBuilder } from "discord.js";
import { isAllowedToChangeThreadTitle } from "../helpers/permissionsHelpers";
import InteractionContext from "../models/InteractionContext";
import NeedleCommand from "../models/NeedleCommand";

export default class TitleCommand extends NeedleCommand {
	public async getBuilder() {
		return new SlashCommandBuilder()
			.setName("title")
			.setDescription("Sets the title of a thread")
			.setDMPermission(false) // TODO: .setDefaultMemberPermissions
			.addStringOption(option => {
				return option.setName("value").setDescription("The new title of the thread").setRequired(true);
			})
			.toJSON();
	}

	public async execute(context: InteractionContext): Promise<void> {
		const { messages, replyInSecret } = context;
		if (!context.isInPublicThread() || !context.isSlashCommand()) {
			return replyInSecret(context.validationError);
		}

		const { channel, member, options } = context.interaction;
		const newThreadName = options.getString("value", true);
		const userHasPermission = await isAllowedToChangeThreadTitle(channel, member);
		const botHasPermission = await isAllowedToChangeThreadTitle(channel, channel.guild.members.me);

		if (!userHasPermission) return replyInSecret(messages.ERR_INSUFFICIENT_PERMS);
		if (!botHasPermission) return replyInSecret("Oh nooo"); // TODO: Make message key for bot not having permissions to change title in thread
		if (channel.name === newThreadName) return replyInSecret(messages.ERR_NO_EFFECT);

		await channel.setName(newThreadName);
		await replyInSecret("Success!");
	}
}
