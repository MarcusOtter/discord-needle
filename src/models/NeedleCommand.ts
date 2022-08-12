import { RESTPostAPIApplicationCommandsJSONBody, SlashCommandBuilder } from "discord.js";
import { Nullish, SlashCommandBuilderWithOptions } from "../helpers/typeHelpers";
import type NeedleBot from "../NeedleBot";
import ChannelType from "./enums/ChannelType";
import type InteractionContext from "./InteractionContext";

export default abstract class NeedleCommand {
	public readonly id: Nullish<string>;
	protected readonly bot: NeedleBot;

	public abstract get name(): string;
	public abstract get description(): string;
	public abstract get allowedChannels(): ChannelType;

	constructor(id: Nullish<string>, bot: NeedleBot) {
		this.id = id;
		this.bot = bot;
	}

	public addOptions?(builder: SlashCommandBuilder): SlashCommandBuilderWithOptions;
	public abstract execute(context: InteractionContext): Promise<void>;

	public async getBuilderJson(): Promise<RESTPostAPIApplicationCommandsJSONBody> {
		const builder = this.getDefaultBuilder();
		return this.addOptions ? this.addOptions(builder).toJSON() : builder.toJSON();
	}

	// TODO: Default permissions
	private getDefaultBuilder(): SlashCommandBuilder {
		return new SlashCommandBuilder()
			.setName(this.name)
			.setDescription(this.description)
			.setDMPermission((this.allowedChannels & ChannelType.DirectMessage) === ChannelType.DirectMessage);
	}
}
