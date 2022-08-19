import {
	ApplicationCommandPermissions,
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
	protected readonly defaultPermissions?: bigint;

	public abstract readonly name: string;
	public abstract readonly description: string;
	// Category can eventually be replaced with "isUsableInDMs" when help command is refactored
	public abstract readonly category: CommandCategory;

	constructor(id: string, bot: NeedleBot) {
		this.id = id;
		this.bot = bot;
	}

	public addOptions?(builder: SlashCommandBuilder): SlashCommandBuilderWithOptions;
	public abstract execute(context: InteractionContext): Promise<void>;

	public hasPermissionToExecute = async (member: GuildMember, channel: GuildTextBasedChannel): Promise<boolean> => {
		if (member.permissionsIn(channel).has(PermissionFlagsBits.Administrator)) return true;

		const channelId = channel.isThread() ? channel.parentId : channel.id;
		if (!channelId) return false; // Type error https://github.com/discordjs/discord.js/issues/8471

		// Type error: https://github.com/discordjs/discord.js/issues/8096
		const permissionOverrides = await member.guild.commands.permissions.fetch({});
		const applicationId = this.bot.client.application?.id;
		if (!applicationId) return false; // bot is not ready to receive events

		const commandPermissions = permissionOverrides.get(this.id);
		if (commandPermissions) {
			return this.isAllowed(member, channelId, commandPermissions);
		}

		const botPermissions = permissionOverrides.get(applicationId);
		if (botPermissions) {
			return this.isAllowed(member, channelId, botPermissions);
		}

		// Use command default permissions because there are no server overrides
		return member.permissionsIn(channel).has(getMinimumRequiredPermissions() | (this.defaultPermissions ?? 0n));
	};

	private async isAllowed(member: GuildMember, channelId: string, permissions: ApplicationCommandPermissions[]) {
		const guildId = BigInt(member.guild.id);
		const memberRoleOverrides = [];
		let allChannelsAllowed = true; // default value, only in "permissions" if overwritten
		let everyoneRoleAllowed = true; // default value, only in "permissions" if overwritten
		let memberOverride = undefined;
		let channelOverride = undefined;

		for (const { id, permission: allowed, type } of permissions) {
			// Application command permission constant (see Discord developer docs)
			const isAllChannel = id === (guildId - 1n).toString();
			if (isAllChannel) {
				allChannelsAllowed = allowed;
				continue;
			}

			// Application command permission constant (see Discord developer docs)
			const isEveryoneRole = id === guildId.toString();
			if (isEveryoneRole) {
				everyoneRoleAllowed = allowed;
				continue;
			}

			if (type === ApplicationCommandPermissionType.Channel && channelId === id) {
				channelOverride = allowed;
				continue;
			}

			const memberRoles = (await member.fetch(true)).roles.cache;
			if (type === ApplicationCommandPermissionType.Role && memberRoles.has(id)) {
				memberRoleOverrides.push(allowed);
				continue;
			}

			if (type === ApplicationCommandPermissionType.User && member.id === id) {
				memberOverride = allowed;
				continue;
			}
		}

		// Channel has presedence over roles & member overrides
		if (!allChannelsAllowed) return channelOverride === true;
		if (allChannelsAllowed && channelOverride === false) return false;

		// Member has presedence over roles
		if (memberOverride !== undefined) return memberOverride;

		// If you have at least one role with explicit permission (other than @everyone), you are allowed
		if (!everyoneRoleAllowed) return memberRoleOverrides.some(r => r === true);
		if (everyoneRoleAllowed && memberRoleOverrides.every(r => r === false)) return false;

		return true;
	}

	private getDefaultBuilder(): SlashCommandBuilder {
		return new SlashCommandBuilder()
			.setName(this.name)
			.setDescription(this.description)
			.setDMPermission(this.category === CommandCategory.Info)
			.setDefaultMemberPermissions(getMinimumRequiredPermissions() | (this.defaultPermissions ?? 0n));
	}
}
