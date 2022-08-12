import ListenerRunType from "../models/enums/ListenerRunType";
import NeedleEventListener from "../models/NeedleEventListener";
import type { ClientEvents } from "discord.js";
import InteractionContext from "../models/InteractionContext";
import NeedleBot from "../NeedleBot";
import CommandExecutorService from "../services/CommandExecutorService";
import ObjectFactory from "../ObjectFactory";

export default class InteractionCreateListener extends NeedleEventListener {
	private readonly commandExecutor: CommandExecutorService;

	constructor(name: keyof ClientEvents, bot: NeedleBot) {
		super(name, bot);
		this.commandExecutor = ObjectFactory.createCommandExecutorService();
	}

	public getRunType(): ListenerRunType {
		return ListenerRunType.EveryTime;
	}

	public async onEmitted(...[interaction]: ClientEvents["interactionCreate"]): Promise<void> {
		// TODO: Add message context to InteractionContext maybe

		if (!interaction.isChatInputCommand() && !interaction.isModalSubmit() && !interaction.isButton()) {
			return;
		}

		const context = new InteractionContext(this.bot, interaction);

		if (interaction.isChatInputCommand()) {
			const command = this.bot.getCommand(interaction.commandName);
			await this.commandExecutor.execute(command, context);
		}

		if (interaction.isButton()) {
			const button = this.bot.getButton(interaction.customId);
			await button?.press(context);
		}

		if (interaction.isModalSubmit()) {
			const modal = this.bot.getModal(interaction.customId);
			await modal?.submit(context);
		}
	}
}
