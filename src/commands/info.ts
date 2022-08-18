import NeedleCommand from "../models/NeedleCommand";
import type InteractionContext from "../models/InteractionContext";
import type NeedleBot from "../NeedleBot";
import type InformationService from "../services/InformationService";
import ObjectFactory from "../ObjectFactory";
import { plural } from "../helpers/stringHelpers";
import CommandCategory from "../models/enums/CommandCategory";
import { EmbedBuilder } from "discord.js";

export default class InfoCommand extends NeedleCommand {
	public readonly name = "info";
	public readonly description = "See information about Needle";
	public readonly category = CommandCategory.Info;

	private readonly infoService: InformationService;

	constructor(id: string, bot: NeedleBot) {
		super(id, bot);
		this.infoService = ObjectFactory.createInformationService();
	}

	public async execute({ interaction }: InteractionContext): Promise<void> {
		const info = await this.getInformationEmbed();
		const descriptionEmbed = this.getDescriptionEmbed();
		await interaction.reply({ content: info, embeds: [descriptionEmbed], ephemeral: true });
	}

	// TODO: Make actual embed
	private async getInformationEmbed(): Promise<string> {
		const nUsers = plural("user", this.infoService.getUserCount());
		const nServers = plural("server", this.infoService.getServerCount());
		const ping = this.infoService.getWebSocketPing();

		return `I am serving ${nUsers} across ${nServers}.\nPing: ${ping}ms`;
	}

	private getDescriptionEmbed() {
		return new EmbedBuilder()
			.setColor("#2f3136")
			.setDescription(
				"Needle is a bot that creates [threads](https://discord.com/blog/connect-the-conversation-with-threads-on-discord) in certain channels automatically. You can interact with Needle through [slash commands](https://support.discord.com/hc/en-us/articles/1500000368501-Slash-Commands-FAQ) and buttons. If you want help with using this bot, feel free to join the [support server](https://discord.gg/8BmnndXHp6)."
			);
	}
}
