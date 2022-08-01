import { ActivityType, Client, GatewayIntentBits } from "discord.js";
import { deleteConfigsFromUnknownServers, getApiToken, resetConfigToDefault } from "./destroy-me/configHelpers";
import { handleMessageCreate } from "./destroy-me/handlers/messageHandler";
import { handleInteractionCreate } from "./destroy-me/handlers/interactionHandler";
import CommandLoader from "./services/CommandLoader";

export default class NeedleBot {
	private static instance?: NeedleBot;

	private discordClient: Client;
	private isConnected = false;

	private constructor() {
		const sweepSettings = {
			interval: 14400, // 4h
			lifetime: 3600, // 1h
		};

		this.discordClient = new Client({
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

	public static getInstance(): NeedleBot {
		if (NeedleBot.instance === undefined) {
			NeedleBot.instance = new NeedleBot();
		}

		return NeedleBot.instance;
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
		await CommandLoader.loadCommands();
	}

	public registerEventListerners(): void {
		this.discordClient.once("ready", () => {
			console.log("Ready!");
			deleteConfigsFromUnknownServers(this.discordClient);
		});

		this.discordClient.on("messageCreate", message => handleMessageCreate(message).catch(console.error));
		this.discordClient.on("interactionCreate", interaction => {
			handleInteractionCreate(interaction).catch(console.error);
		});
		this.discordClient.on("guildDelete", guild => {
			resetConfigToDefault(guild.id);
		});
	}
}
