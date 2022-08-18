import {
	ApplicationCommandPermissionType,
	GuildMember,
	GuildTextBasedChannel,
	PermissionFlagsBits,
	RESTPostAPIApplicationCommandsJSONBody,
	SlashCommandBuilder,
} from "discord.js";
import { getMinimumRequiredPermissions } from "../helpers/permissionsHelpers";
import { SlashCommandBuilderWithOptions } from "../helpers/typeHelpers";
import type NeedleBot from "../NeedleBot";
import CommandCategory from "./enums/CommandCategory";
import type InteractionContext from "./InteractionContext";

export default abstract class NeedleCommand {
	public readonly id: string;
	public get builderJson(): RESTPostAPIApplicationCommandsJSONBody {
		const builder = this.getDefaultBuilder();
		return this.addOptions ? this.addOptions(builder).toJSON() : builder.toJSON();
	}

	protected readonly bot: NeedleBot;

	public abstract readonly name: string;
	public abstract readonly description: string;
	// Category can eventually be replaced with "isUsableInDMs" when help command is refactored
	public abstract readonly category: CommandCategory;

	public readonly permissions?: bigint;

	constructor(id: string, bot: NeedleBot) {
		this.id = id;
		this.bot = bot;
	}

	public addOptions?(builder: SlashCommandBuilder): SlashCommandBuilderWithOptions;
	public abstract execute(context: InteractionContext): Promise<void>;

	public async hasPermissionToExecute(member: GuildMember, channel: GuildTextBasedChannel): Promise<boolean> {
		// if (member.permissionsIn(channel).has(PermissionFlagsBits.Administrator, true)) return true;

		// TODO!!! If this doesn't have any overloads, use default and get out. That's why I'm getting errors 100%
		const commandPermissions = await member.guild.commands.permissions.fetch({ command: this.id });
		console.dir(commandPermissions);
		let channelAllowed = false;
		let userAllowed = false;
		let someRoleAllowed = false;
		let allRolesAllowed = true;

		for (const { id, permission: allowed, type } of commandPermissions) {
			// Discord docs - Application Command Permissions Constants
			const isAnyChannel = id === (BigInt(member.guild.id) - 1n).toString();
			if (isAnyChannel || (type === ApplicationCommandPermissionType.Channel && channel.id === id)) {
				channelAllowed = allowed;
				continue;
			}

			// TODO: How to fetch and not rely on cache? await member.fetch()?
			if (type === ApplicationCommandPermissionType.Role && member.roles.cache.has(id)) {
				if (allowed) {
					someRoleAllowed = true;
				} else {
					allRolesAllowed = false;
				}
			}

			if (type === ApplicationCommandPermissionType.User && member.id === id) {
				userAllowed = allowed;
			}
		}

		console.dir({ channelAllowed, userAllowed, someRoleAllowed, allRolesAllowed });

		// member.guild.commands.permissions.has({ command: this.id, permissionId: member.id });
		// TODO: default permissions
		return false;
	}

	private getDefaultBuilder(): SlashCommandBuilder {
		return new SlashCommandBuilder()
			.setName(this.name)
			.setDescription(this.description)
			.setDMPermission(this.category === CommandCategory.Info)
			.setDefaultMemberPermissions(getMinimumRequiredPermissions() | (this.permissions ?? 0n));
	}
}
