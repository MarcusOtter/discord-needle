import { Guild } from "discord.js";
import * as defaultConfig from "../config.json";
import { NeedleConfig } from "../types/needleConfig";
import { MessageKey } from "./messageHelpers";

const guildConfigs = new Map<string, NeedleConfig>();

export function getConfig(guildId = ""): NeedleConfig {
	const guildConfig = guildConfigs.get(guildId);

	// I don't quite understand why I need to make copies here
	// but if I don't, the default config is overriden
	const defaultConfigCopy = JSON.parse(JSON.stringify(defaultConfig));
	return Object.assign({}, defaultConfigCopy, guildConfig);
}

export function getApiToken(): string | undefined {
	return process.env.DISCORD_API_TOKEN;
}

// Used by deploy-commands.js
export function getClientId(): string | undefined {
	return process.env.CLIENT_ID;
}

// Used by deploy-commands.js
export function getGuildId(): string | undefined {
	return process.env.GUILD_ID;
}

export function setMessage(guild: Guild, messageKey: MessageKey, value: string): boolean {
	const config = getConfig(guild.id);
	if (!config || !config.messages) { return false; }
	if (value.length > 2000) { return false; }

	config.messages[messageKey] = value;
	return setConfig(guild, config);
}

export function enableAutothreading(guild: Guild, channelId: string, message = ""): boolean {
	const config = getConfig(guild.id);
	if (!config || !config.threadChannels) { return false; }
	if (message.length > 2000) { return false; }

	const index = config.threadChannels.findIndex(x => x?.channelId === channelId);
	if (index > -1) {
		config.threadChannels[index].messageContent = message;
	}
	else {
		config.threadChannels.push({ channelId: channelId, messageContent: message });
	}

	return setConfig(guild, config);
}

export function disableAutothreading(guild: Guild, channelId: string): boolean {
	const config = getConfig(guild.id);
	if (!config || !config.threadChannels) { return false; }

	const index = config.threadChannels.findIndex(x => x?.channelId === channelId);
	if (index > -1) {
		delete config.threadChannels[index];
	}

	return setConfig(guild, config);
}

function setConfig(guild: Guild | null | undefined, config: NeedleConfig): boolean {
	if (!guild) { return false; }

	guildConfigs.set(guild.id, config);
	return true;
}