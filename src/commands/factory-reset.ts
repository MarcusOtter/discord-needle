import CommandCategory from "../models/enums/CommandCategory";
import CommandTag from "../models/enums/CommandTag";
import InteractionContext from "../models/InteractionContext";
import NeedleCommand from "../models/NeedleCommand";

export default class FactoryResetCommand extends NeedleCommand {
	public name = "factory-reset";
	public description = "Reset Needle to factory settings";
	public category = CommandCategory.Configuration;
	public tags = [CommandTag.RequiresSpecialPermissions];

	public async execute(context: InteractionContext): Promise<void> {
		if (!context.isInGuild()) {
			return context.replyInSecret(context.validationError);
		}
		const { replyInSecret, replyInPublic, interaction, messages } = context;

		// TODO: Open modal
		const success = this.bot.configs.delete(interaction.guildId);
		return success
			? replyInPublic("Successfully reset Needle to factory settings.")
			: replyInSecret(messages.ERR_NO_EFFECT);
	}
}
