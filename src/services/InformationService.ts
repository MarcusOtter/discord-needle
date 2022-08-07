import type NeedleBot from "../NeedleBot";

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
}
