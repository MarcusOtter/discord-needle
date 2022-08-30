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

import NeedleCommand from "../models/NeedleCommand.js";
import type InteractionContext from "../models/InteractionContext.js";
import type NeedleBot from "../NeedleBot.js";
import type InformationService from "../services/InformationService.js";
import ObjectFactory from "../ObjectFactory.js";
import { codeBlock } from "../helpers/stringHelpers.js";
import CommandCategory from "../models/enums/CommandCategory.js";
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
		await this.bot.client.application?.fetch();
		const isOwner = interaction.user.id === this.bot.client.application?.owner?.id;
		const infoEmbed = await this.getInformationEmbed(isOwner);
		await interaction.reply({ embeds: [infoEmbed], ephemeral: true });
	}

	private async getInformationEmbed(isOwner = false): Promise<EmbedBuilder> {
		const userCount = this.infoService.getUserCount();
		const serverCount = this.infoService.getServerCount();
		const ping = this.infoService.getWebSocketPing() + "ms";
		const uptime = this.infoService.getUptimeString();
		const largestServer = this.infoService.getLargestServer();
		const cpuPercent = this.infoService.getCpuUsagePercent();
		const ramPercent = this.infoService.getRamUsagePercent();
		const freeRamMb = this.infoService.getFreeRamInMb();
		const version = process.env.npm_package_version ?? "Unknown";

		let fields = [
			{ name: "Servers", value: codeBlock(serverCount), inline: true },
			{ name: "Users", value: codeBlock(userCount), inline: true },
			{ name: "Largest server", value: codeBlock(largestServer), inline: true },
			{ name: "Ping", value: codeBlock(ping), inline: true },
			{ name: "Uptime", value: codeBlock(uptime), inline: true },
			{ name: "Version", value: codeBlock(version), inline: true },
		];

		if (isOwner) {
			fields = fields.concat([
				{ name: "CPU usage", value: codeBlock(cpuPercent + "%"), inline: true },
				{ name: "RAM usage", value: codeBlock(ramPercent + "%"), inline: true },
				{ name: "Free RAM", value: codeBlock(freeRamMb + " MB"), inline: true },
			]);
		}

		return new EmbedBuilder()
			.setColor("#2f3136")
			.setDescription(
				"Needle is a bot that creates [threads](https://discord.com/blog/connect-the-conversation-with-threads-on-discord) in certain channels automatically. You can interact with Needle through [slash commands](https://support.discord.com/hc/en-us/articles/1500000368501-Slash-Commands-FAQ) and buttons. If you want help with using this bot, feel free to join the [support server](https://discord.gg/8BmnndXHp6).\n\n🧑‍💼 **` STATS `**"
			)
			.setFields(fields);
	}
}
