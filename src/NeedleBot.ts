import { Client } from "discord.js";
import { getApiToken } from "./destroy-me/configHelpers";
import CommandsService from "./services/CommandsService";
import NeedleCommand from "./models/NeedleCommand";
import EventListenersService from "./services/EventListenersService";
import ListenerRunType from "./models/enums/ListenerRunType";

export default class NeedleBot {
	private discordClient: Client;
	private commandsService: CommandsService;
	private eventsService: EventListenersService;

	private isConnected = false;

	public constructor(discordClient: Client, commandsService: CommandsService, eventsService: EventListenersService) {
		this.discordClient = discordClient;
		this.commandsService = commandsService;
		this.eventsService = eventsService;
	}

	public async connect(): Promise<void> {
		if (this.isConnected) return;

		await this.discordClient.login(getApiToken());
		this.isConnected = true;
	}

	public async disconnect(): Promise<void> {
		this.discordClient?.destroy();
		this.isConnected = false;
		console.log("Destroyed client");
	}

	public async registerCommands(): Promise<void> {
		await this.commandsService.loadCommands(true, this);
	}

	public getClient(): Client {
		return this.discordClient;
	}

	public async getCommand(commandName: string): Promise<NeedleCommand | undefined> {
		return this.commandsService.getCommand(commandName);
	}

	public async registerEventListerners(): Promise<void> {
		const eventListeners = await this.eventsService.loadEventListeners(true, this);

		for (const listener of eventListeners) {
			const listenerType = listener.getListenerType();

			if (listenerType === ListenerRunType.EveryTime) {
				this.discordClient.on(listener.name, listener.handleEventEmitted);
			} else if (listenerType === ListenerRunType.OnlyOnce) {
				this.discordClient.once(listener.name, listener.handleEventEmitted);
			}
		}

		// this.discordClient.once("ready", () => {
		// 	console.log("Ready!");
		// 	deleteConfigsFromUnknownServers(this.discordClient);
		// });

		// this.discordClient.on("messageCreate", message => handleMessageCreate(message).catch(console.error));
		// this.discordClient.on("interactionCreate", interaction => {
		// 	handleInteractionCreate(interaction).catch(console.error);
		// });
		// this.discordClient.on("guildDelete", guild => {
		// 	resetConfigToDefault(guild.id);
		// });
	}
}
