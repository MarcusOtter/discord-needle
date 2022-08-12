import type { Client, ClientEvents } from "discord.js";
import { getApiToken } from "./destroy-me/helpers/configHelpers";
import type NeedleCommand from "./models/NeedleCommand";
import ListenerRunType from "./models/enums/ListenerRunType";
import type NeedleButton from "./models/NeedleButton";
import type DynamicImportService from "./services/DynamicImportService";
import type NeedleEventListener from "./models/NeedleEventListener";
import ConfigService from "./services/ConfigService";
import CommandImportService from "./services/CommandImportService";

export default class NeedleBot {
	public readonly client: Client;
	public readonly configs: ConfigService;

	private readonly commandsService: CommandImportService;
	private readonly eventsService: DynamicImportService<typeof NeedleEventListener>;
	private readonly buttonsService: DynamicImportService<typeof NeedleButton>;

	private isConnected = false;

	public constructor(
		discordClient: Client,
		commandsService: CommandImportService,
		eventsService: DynamicImportService<typeof NeedleEventListener>,
		buttonsService: DynamicImportService<typeof NeedleButton>,
		configs: ConfigService
	) {
		this.client = discordClient;

		this.commandsService = commandsService;
		this.eventsService = eventsService;
		this.buttonsService = buttonsService;
		this.configs = configs;
	}

	public async connect(): Promise<void> {
		if (this.isConnected) return;

		await this.client.login(getApiToken());
		this.isConnected = true;
	}

	public async disconnect(): Promise<void> {
		this.client?.destroy();
		this.isConnected = false;
		console.log("Destroyed client");
	}

	public async registerCommands(): Promise<void> {
		await this.commandsService.load(true);
	}

	// TODO: Consider if this should be automatic with commands or events
	public async registerButtons(): Promise<void> {
		await this.buttonsService.load(true);
	}

	public getCommand(commandName: string): NeedleCommand | undefined {
		const Command = this.commandsService.get(commandName);
		if (!Command) return;

		const id = this.commandsService.getId(commandName);
		return new Command(id, this);
	}

	public async getAllCommands(): Promise<NeedleCommand[]> {
		const importedCommands = await this.commandsService.load();
		return importedCommands.map(c => new c.Class(this.commandsService.getId(c.fileName), this));
	}

	public getButton(customId: string): NeedleButton | undefined {
		const Button = this.buttonsService.get(customId);
		if (!Button) return;

		return new Button(customId, this);
	}

	public async registerEventListeners(): Promise<void> {
		const importedListeners = await this.eventsService.load(true);

		for (const { fileName, Class } of importedListeners) {
			const listener = new Class(fileName as keyof ClientEvents, this);

			if (listener.getRunType() === ListenerRunType.EveryTime) {
				this.client.on(listener.name, (...args) => listener.onEmitted(...args).catch(this.handleError));
			} else if (listener.getRunType() === ListenerRunType.OnlyOnce) {
				this.client.once(listener.name, (...args) => listener.onEmitted(...args).catch(this.handleError));
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

	private handleError(reason: unknown): void {
		console.error(reason);
	}
}
