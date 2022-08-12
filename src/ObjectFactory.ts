import { ActivityType, Client, GatewayIntentBits } from "discord.js";
import type NeedleButton from "./models/NeedleButton";
import type NeedleEventListener from "./models/NeedleEventListener";
import NeedleBot from "./NeedleBot";
import CommandExecutorService from "./services/CommandExecutorService";
import CommandImportService from "./services/CommandImportService";
import ConfigService from "./services/ConfigService";
import DynamicImportService from "./services/DynamicImportService";
import InformationService from "./services/InformationService";

// This class acts as a composition root.
// We new up all the dependencies and pass them along through constructor injection when possible.
// When not possible, it's used as a ServiceLocator (used in constructors for commands, event listeners, and modals).
// We're not using any abstractions to keep complexity down, but it can be added in the future.

export default class ObjectFactory {
	private static bot: NeedleBot;

	private constructor() {
		// Not allowed
	}

	public static createNeedleBot(): NeedleBot {
		if (this.bot) {
			throw new Error("You should only create the bot once");
		}

		this.bot = new NeedleBot(
			ObjectFactory.createDiscordClient(),
			ObjectFactory.createCommandsService(),
			ObjectFactory.createEventListenersService(),
			ObjectFactory.createButtonsService(),
			ObjectFactory.createConfigService()
		);

		return this.bot;
	}

	public static createInformationService(): InformationService {
		return new InformationService(this.bot);
	}

	public static createCommandExecutorService(): CommandExecutorService {
		return new CommandExecutorService();
	}

	private static createDiscordClient(): Client {
		const sweepSettings = {
			interval: 14400, // 4h
			lifetime: 3600, // 1h
		};

		return new Client({
			intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
			shards: "auto",
			presence: {
				activities: [
					{
						type: ActivityType.Listening,
						name: "/help",
					},
				],
			},
			sweepers: {
				messages: sweepSettings,
				threads: sweepSettings,
			},
		});
	}

	private static createCommandsService(): CommandImportService {
		return new CommandImportService("./commands");
	}

	private static createEventListenersService(): DynamicImportService<typeof NeedleEventListener> {
		return new DynamicImportService<typeof NeedleEventListener>("./eventListeners");
	}

	private static createButtonsService(): DynamicImportService<typeof NeedleButton> {
		return new DynamicImportService<typeof NeedleButton>("./buttons");
	}

	private static createConfigService(): ConfigService {
		return new ConfigService("./configs");
	}
}
