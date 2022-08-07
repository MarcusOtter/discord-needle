import { type RESTPostAPIApplicationCommandsJSONBody, SlashCommandBuilder, type ClientEvents } from "discord.js";
import NeedleCommand from "../models/NeedleCommand";
import type InteractionContext from "../models/InteractionContext";
import type NeedleBot from "../NeedleBot";
import type InformationService from "../services/InformationService";
import ObjectFactory from "../ObjectFactory";

export default class InfoCommand extends NeedleCommand {
	private infoService: InformationService;

	constructor(name: keyof ClientEvents, bot: NeedleBot) {
		super(name, bot);
		this.infoService = ObjectFactory.createInformationService();
	}

	public async getBuilder(): Promise<RESTPostAPIApplicationCommandsJSONBody> {
		return new SlashCommandBuilder()
			.setName("info")
			.setDescription("Get information about Needle")
			.setDMPermission(true)
			.toJSON();
	}

	public async execute({ interaction }: InteractionContext): Promise<void> {
		const info = await this.getInformationEmbed();
		await interaction.reply({ content: info });
		// return this.sendInformationEmbed(interaction.channel);
	}

	// TODO: Make actual embed
	private async getInformationEmbed(): Promise<string> {
		const serverCount = this.infoService.getServerCount();
		const userCount = this.infoService.getUserCount();
		const ping = this.infoService.getWebSocketPing();

		return `I am serving ${userCount} users across ${serverCount} servers.\nPing: ${ping}ms`;
	}
}
