import type { Client } from "discord.js";
import type NeedleBot from "../NeedleBot";

export default class InformationService {
	private client: Client;

	constructor(bot: NeedleBot) {
		this.client = bot.getClient();
	}

	public getServerCount(): number {
		return this.client.guilds.cache.size;
	}

	public getUserCount(): number {
		return this.client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
	}

	public getWebSocketPing(): number {
		return Math.round(this.client.ws.ping);
	}
}
