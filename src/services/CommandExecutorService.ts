import type InteractionContext from "../models/InteractionContext";
import type NeedleCommand from "../models/NeedleCommand";

export default class CommandExecutorService {
	public async execute(command: NeedleCommand, context: InteractionContext): Promise<void> {
		if (!context.interaction.isCommand()) return;

		// TODO: This thing is a bit weird, we handle two exceptions differently, idk which one it actually uses
		try {
			return await command.execute(context).catch(e => console.error(e));
		} catch (e) {
			// TODO: Button to support server and bug report
			context.interaction.reply({
				content: context.messages.ERR_UNKNOWN,
				ephemeral: true,
			});

			console.error(e);
		}
	}
}
