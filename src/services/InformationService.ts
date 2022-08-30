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

import { formatNumber } from "../helpers/stringHelpers.js";
import type NeedleBot from "../NeedleBot.js";
import os from "os";

export default class InformationService {
	private readonly bot: NeedleBot;

	constructor(bot: NeedleBot) {
		this.bot = bot;
	}

	public getServerCount(): number {
		return this.bot.client.guilds.cache.size;
	}

	public getUserCount(): number {
		return this.bot.client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
	}

	public getWebSocketPing(): number {
		return Math.round(this.bot.client.ws.ping);
	}

	public getCpuUsagePercent(): number {
		return Math.round(os.loadavg()[0] * 100);
	}

	public getRamUsagePercent(): number {
		return Math.round((1 - os.freemem() / os.totalmem()) * 100);
	}

	public getFreeRamInMb(): number {
		return Math.round(os.freemem() / 1024 / 1024);
	}

	public getLargestServer(): string {
		let largestServer;
		for (const server of this.bot.client.guilds.cache.values()) {
			if (server.memberCount > (largestServer?.memberCount ?? 0)) {
				largestServer = server;
			}
		}

		return largestServer ? `${largestServer.name} (${formatNumber(largestServer.memberCount)} members)` : "None";
	}

	// Generate a string like 1d 8h 23m 12s or 8h 23m 0s
	public getUptimeString(): string {
		const uptimeMs = this.bot.client.uptime;
		if (!uptimeMs) return "Not online";

		const days = Math.floor(uptimeMs / 1000 / 60 / 60 / 24);
		const hours = Math.floor((uptimeMs / 1000 / 60 / 60) % 24);
		const minutes = Math.floor((uptimeMs / 1000 / 60) % 60);
		const seconds = Math.floor((uptimeMs / 1000) % 60);

		return `${days ? `${days}d ` : ""}${hours ? `${hours}h ` : ""}${minutes ? `${minutes}m ` : ""}${seconds}s`;
	}
}
