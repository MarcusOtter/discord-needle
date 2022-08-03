import type { Client, RESTPostAPIApplicationCommandsJSONBody } from "discord.js";
import type NeedleBot from "../NeedleBot";
import type InteractionContext from "./InteractionContext";

export default abstract class NeedleCommand {
	protected bot: NeedleBot;
	protected client: Client;

	constructor(bot: NeedleBot) {
		this.bot = bot;
		this.client = bot.getClient();
	}

	public abstract getSlashCommandBuilder(): Promise<RESTPostAPIApplicationCommandsJSONBody>;
	public abstract execute(context: InteractionContext): Promise<void>;
}
