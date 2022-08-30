import type InteractionContext from "../models/InteractionContext.js";
import type NeedleCommand from "../models/NeedleCommand.js";

export default class CommandExecutorService {
	public async execute(command: NeedleCommand, context: InteractionContext): Promise<void> {
		try {
			return await command.execute(context).catch(e => console.error(e));
		} catch (e) {
			if (!context.interaction.isRepliable()) return;

			// TODO: Button to support server and bug report
			context.interaction.reply({
				content: context.settings.ErrorUnknown,
				ephemeral: true,
			});

			console.error(e);
		}
	}
}
