import type { Client, ClientEvents } from "discord.js";
import { getApiToken } from "./destroy-me/helpers/configHelpers";
import type NeedleCommand from "./models/NeedleCommand";
import ListenerRunType from "./models/enums/ListenerRunType";
import type NeedleButton from "./models/NeedleButton";
import type DynamicImportService from "./services/DynamicImportService";
import type NeedleEventListener from "./models/NeedleEventListener";

export default class NeedleBot {
	public readonly client: Client;

	private commandsService: DynamicImportService<typeof NeedleCommand>;
	private eventsService: DynamicImportService<typeof NeedleEventListener>;
	private buttonsService: DynamicImportService<typeof NeedleButton>;

	private isConnected = false;

	public constructor(
		discordClient: Client,
		commandsService: DynamicImportService<typeof NeedleCommand>,
		eventsService: DynamicImportService<typeof NeedleEventListener>,
		buttonsService: DynamicImportService<typeof NeedleButton>
	) {
		this.client = discordClient;

		this.commandsService = commandsService;
		this.eventsService = eventsService;
		this.buttonsService = buttonsService;
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

	public async registerButtons(): Promise<void> {
		await this.buttonsService.load(true);
	}

	public getCommand(commandName: string): NeedleCommand | undefined {
		const Command = this.commandsService.get(commandName);
		if (!Command) return;

		return new Command(commandName, this);
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
