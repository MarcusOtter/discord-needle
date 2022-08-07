import ListenerRunType from "../models/enums/ListenerRunType";
import NeedleEventListener from "../models/NeedleEventListener";
import type { ClientEvents } from "discord.js";
import InteractionContext from "../models/InteractionContext";
import { isValidChatInputCommand } from "../helpers/validationHelpers";

export default class ReadyEventListener extends NeedleEventListener {
	public getListenerType(): ListenerRunType {
		return ListenerRunType.EveryTime;
	}

	public async handleEventEmitted(...[interaction]: ClientEvents["interactionCreate"]): Promise<void> {
		// TODO: Add message context to InteractionContext maybe

		if (isValidChatInputCommand(interaction)) {
			const command = await this.bot.getCommand(interaction.commandName);
			const context = new InteractionContext(this.bot, interaction);
			try {
				return await command?.execute(context);
			} catch (e) {
				// TODO: Button to support server and bug report
				interaction.reply({
					content: "Something went wrong with this command, please try again later.",
					ephemeral: true,
				});
				throw e;
			}
		}

		// TODO: Other interactions
	}
}
