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

import { Client, GatewayIntentBits } from "discord.js";
import type NeedleButton from "./models/NeedleButton.js";
import type NeedleEventListener from "./models/NeedleEventListener.js";
import type NeedleModal from "./models/NeedleModal.js";
import NeedleBot from "./NeedleBot.js";
import CommandExecutorService from "./services/CommandExecutorService.js";
import CommandImportService from "./services/CommandImportService.js";
import ConfigService from "./services/ConfigService.js";
import CooldownService from "./services/CooldownService.js";
import DynamicImportService from "./services/DynamicImportService.js";
import InformationService from "./services/InformationService.js";
import ThreadCreationService from "./services/ThreadCreationService.js";

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
			this.createDiscordClient(),
			this.createCommandsService(),
			this.createEventListenersService(),
			this.createButtonsService(),
			this.createModalsService(),
			this.createConfigService(),
			this.createCooldownService()
		);

		return this.bot;
	}

	public static createInformationService(): InformationService {
		return new InformationService(this.bot);
	}

	public static createCommandExecutorService(): CommandExecutorService {
		return new CommandExecutorService();
	}

	public static createThreadCreationService(): ThreadCreationService {
		return new ThreadCreationService(this.bot);
	}

	private static createDiscordClient(): Client {
		const sweepSettings = {
			interval: 14400, // 4h
			lifetime: 3600, // 1h
		};

		return new Client({
			intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
			shards: "auto",
			sweepers: {
				messages: sweepSettings,
				threads: sweepSettings,
			},
		});
	}

	private static createCooldownService(): CooldownService {
		return new CooldownService();
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

	private static createModalsService(): DynamicImportService<typeof NeedleModal> {
		return new DynamicImportService<typeof NeedleModal>("./modals");
	}

	private static createConfigService(): ConfigService {
		return new ConfigService("./configs");
	}
}
