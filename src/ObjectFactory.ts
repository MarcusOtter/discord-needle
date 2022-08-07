import { ActivityType, Client, GatewayIntentBits } from "discord.js";
import NeedleBot from "./NeedleBot";
import CommandsService from "./services/CommandsService";
import EventListenersService from "./services/EventListenersService";
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
			throw new Error("You should only create the bot once.");
		}

		this.bot = new NeedleBot(
			ObjectFactory.createDiscordClient(),
			ObjectFactory.createCommandsService(),
			ObjectFactory.createEventListenersService()
		);

		return this.bot;
	}

	public static createInformationService(): InformationService {
		return new InformationService(this.bot);
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

	private static createCommandsService(): CommandsService {
		return new CommandsService();
	}

	private static createEventListenersService(): EventListenersService {
		return new EventListenersService();
	}
}
