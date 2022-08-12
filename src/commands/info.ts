import NeedleCommand from "../models/NeedleCommand";
import type InteractionContext from "../models/InteractionContext";
import type NeedleBot from "../NeedleBot";
import type InformationService from "../services/InformationService";
import ObjectFactory from "../ObjectFactory";
import { plural } from "../helpers/stringHelpers";
import { Nullish } from "../helpers/typeHelpers";
import ChannelType from "../models/enums/ChannelType";

export default class InfoCommand extends NeedleCommand {
	public readonly name = "info";
	public readonly description = "Shows information about Needle";
	public readonly allowedChannels = ChannelType.Any;

	private readonly infoService: InformationService;

	constructor(id: Nullish<string>, bot: NeedleBot) {
		super(id, bot);
		this.infoService = ObjectFactory.createInformationService();
	}

	public async execute({ interaction }: InteractionContext): Promise<void> {
		if (!interaction.isCommand()) return;

		const info = await this.getInformationEmbed();
		await interaction.reply({ content: info });
	}

	// TODO: Make actual embed
	private async getInformationEmbed(): Promise<string> {
		const nUsers = plural("user", this.infoService.getUserCount());
		const nServers = plural("server", this.infoService.getServerCount());
		const ping = this.infoService.getWebSocketPing();

		return `I am serving ${nUsers} across ${nServers}.\nPing: ${ping}ms`;
	}
}
