import { Client, RESTPostAPIApplicationCommandsJSONBody, SlashCommandBuilder, TextBasedChannel } from "discord.js";
import type { ValidCommandInteraction } from "../validators/InteractionValidator";
import NeedleCommand from "../models/NeedleCommand";

class InfoCommand extends NeedleCommand {
	public executeFromModalSubmit(): Promise<void> {
		throw new Error("Not supported");
	}

	public executeFromButtonClick(): Promise<void> {
		throw new Error("Not supported");
	}

	public async executeFromChatInput(interaction: ValidCommandInteraction): Promise<void> {
		const info = await this.getInformationEmbed(interaction.client);
		await interaction.reply({ content: info });
		// return this.sendInformationEmbed(interaction.channel);
	}

	public async getSlashCommandBuilder(): Promise<RESTPostAPIApplicationCommandsJSONBody> {
		const builder = new SlashCommandBuilder()
			.setName(this.getName())
			.setDescription(this.getShortDescription())
			.toJSON();
		return builder;
	}

	private async getInformationEmbed(client: Client): Promise<string> {
		return "I am in " + client.guilds.cache.size + " servers";
	}
}

const command = new InfoCommand("info", "blabla", "blablabla");

export default command;
