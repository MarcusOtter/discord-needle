import { RESTPostAPIApplicationCommandsJSONBody, SlashCommandBuilder } from "discord.js";
import { getDefaultPermissions } from "../helpers/permissionsHelpers";
import { Nullish, SlashCommandBuilderWithOptions } from "../helpers/typeHelpers";
import type NeedleBot from "../NeedleBot";
import CommandCategory from "./enums/CommandCategory";
import CommandTag from "./enums/CommandTag";
import type InteractionContext from "./InteractionContext";

export default abstract class NeedleCommand {
	public readonly id: Nullish<string>;
	public get builderJson(): RESTPostAPIApplicationCommandsJSONBody {
		const builder = this.getDefaultBuilder();
		return this.addOptions ? this.addOptions(builder).toJSON() : builder.toJSON();
	}

	protected readonly bot: NeedleBot;

	public abstract readonly name: string;
	public abstract readonly description: string;
	public abstract readonly category: CommandCategory;

	public readonly tags?: CommandTag[];
	public readonly permissions?: bigint;

	constructor(id: Nullish<string>, bot: NeedleBot) {
		this.id = id;
		this.bot = bot;
	}

	public addOptions?(builder: SlashCommandBuilder): SlashCommandBuilderWithOptions;
	public abstract execute(context: InteractionContext): Promise<void>;

	private getDefaultBuilder(): SlashCommandBuilder {
		return new SlashCommandBuilder()
			.setName(this.name)
			.setDescription(this.description)
			.setDMPermission(this.category === CommandCategory.Info)
			.setDefaultMemberPermissions(getDefaultPermissions() | (this.permissions ?? 0n));
	}
}
