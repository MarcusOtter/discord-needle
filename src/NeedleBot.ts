/*
This file is part of Needle.

Needle is free software: you can redistribute it and/or modify it under the terms of the GNU
Affero General Public License as published by the Free Software Foundation, either version 3 of
the License, or (at your option) any later version.

Needle is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even
the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero
General Public License for more details.

You should have received a copy of the GNU Affero General Public License along with Needle.
If not, see <https://www.gnu.org/licenses/>.
*/

import type { Client } from "discord.js";
import type NeedleCommand from "./models/NeedleCommand.js";
import ListenerRunType from "./models/enums/ListenerRunType.js";
import type NeedleButton from "./models/NeedleButton.js";
import type DynamicImportService from "./services/DynamicImportService.js";
import type NeedleEventListener from "./models/NeedleEventListener.js";
import type ConfigService from "./services/ConfigService.js";
import type CommandImportService from "./services/CommandImportService.js";
import type NeedleModal from "./models/NeedleModal.js";
import type CooldownService from "./services/CooldownService.js";

export default class NeedleBot {
	public readonly client: Client;
	public readonly configs: ConfigService;

	private readonly commandsService: CommandImportService;
	private readonly cooldownService: CooldownService;
	private readonly eventsService: DynamicImportService<typeof NeedleEventListener>;
	private readonly buttonsService: DynamicImportService<typeof NeedleButton>;
	private readonly modalsService: DynamicImportService<typeof NeedleModal>;

	private isConnected = false;

	public constructor(
		discordClient: Client,
		commandsService: CommandImportService,
		eventsService: DynamicImportService<typeof NeedleEventListener>,
		buttonsService: DynamicImportService<typeof NeedleButton>,
		modalsService: DynamicImportService<typeof NeedleModal>,
		configService: ConfigService,
		cooldownService: CooldownService
	) {
		this.client = discordClient;

		this.commandsService = commandsService;
		this.eventsService = eventsService;
		this.buttonsService = buttonsService;
		this.modalsService = modalsService;
		this.configs = configService;
		this.cooldownService = cooldownService;
	}

	public async loadDynamicImports(): Promise<void> {
		await this.commandsService.load(true);
		await this.buttonsService.load(true);
		await this.modalsService.load(true);

		await this.registerEventListeners();
	}

	public async connect(): Promise<void> {
		if (this.isConnected) return;

		await this.client.login(process.env.DISCORD_API_TOKEN);
		this.isConnected = true;
	}

	public async disconnect(): Promise<void> {
		this.client?.destroy();
		this.isConnected = false;
		console.log("Destroyed client");
	}

	public getCommand(commandName: string): NeedleCommand {
		const Command = this.commandsService.get(commandName);
		const id = this.commandsService.getId(commandName);
		return new Command(id, this);
	}

	public async getAllCommands(): Promise<NeedleCommand[]> {
		const importedCommands = await this.commandsService.load();
		return importedCommands.map(c => new c.Class(this.commandsService.getId(c.fileName), this));
	}

	public getButton(customId: string): NeedleButton {
		const Button = this.buttonsService.get(customId);
		return new Button(this);
	}

	public getModal(customId: string): NeedleModal {
		const Modal = this.modalsService.get(customId);
		return new Modal(this);
	}

	public isAllowedToRename(threadId: string): boolean {
		return !this.cooldownService.willBeRateLimited(threadId);
	}

	public reportThreadRenamed(threadId: string): void {
		this.cooldownService.reportThreadRenamed(threadId);
	}

	private async registerEventListeners(): Promise<void> {
		const importedListeners = await this.eventsService.load(true);

		for (const { Class } of importedListeners) {
			const listener = new Class(this);

			if (listener.runType === ListenerRunType.EveryTime) {
				this.client.on(listener.name, (...args) => {
					try {
						listener.handle(args).catch(this.handleError);
					} catch (e) {
						console.error(e);
					}
				});
			} else if (listener.runType === ListenerRunType.OnlyOnce) {
				this.client.once(listener.name, (...args) => {
					try {
						listener.handle(args).catch(this.handleError);
					} catch (e) {
						console.error(e);
					}
				});
			}
		}
	}

	private handleError(reason: unknown): void {
		console.error(reason);
	}
}
