import { Guild, GuildTextBasedChannel } from "discord.js";
import * as defaultConfig from "../config.json";
import * as overrideConfig from "../overrideConfig.json";
import { NeedleConfig, SafeNeedleConfig } from "../types/needleConfig";
import { MessageKey } from "./messageHelpers";

export const configChannelName = "needle-config";
const guildConfigs = new Map<string, SafeNeedleConfig>();

export function getConfig(guildId = ""): SafeNeedleConfig {
	return sanitizeConfig(dangerouslyGetConfig(guildId));
}

export function setConfig(guild: Guild | null | undefined, configObject: Record<string, unknown>): boolean {
	if (!guild) { return false; }
	const validConfigObject = removeInvalidConfigKeys(configObject);
	guildConfigs.set(guild.id, sanitizeConfig(validConfigObject));

	const configChannel = getManualConfigChannel(guild);
	if (configChannel) {
		configChannel.send("We updating config in here");
	}

	return true;
}

/** Removes the keys of an object that are not valid keys of a safe configuration object. */
export function removeInvalidConfigKeys(configObject: Record<string, unknown>): Record<string, unknown> {
	const validConfigKeys = Object.keys(sanitizeConfig(dangerouslyGetConfig()));

	Object.keys(configObject).forEach(key => {
		if (validConfigKeys.includes(key)) return;
		delete configObject[key];
	});

	return configObject;
}

export function getApiToken(): NeedleConfig["discordApiToken"] {
	return dangerouslyGetConfig().discordApiToken;
}

export function getDevConfig(): NeedleConfig["dev"] {
	return dangerouslyGetConfig().dev;
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

export function getManualConfigChannel(guild: Guild): GuildTextBasedChannel | undefined {
	const channel = guild.channels.cache.find(x => x.name === configChannelName);
	if (!channel || channel.isThread() || !channel.isText()) {
		return undefined;
	}

	return channel;
}

function sanitizeConfig(config: NeedleConfig): SafeNeedleConfig {
	delete config.discordApiToken;
	delete config.dev;
	return config;
}

function dangerouslyGetConfig(guildId = ""): NeedleConfig {
	const guildConfig = guildConfigs.get(guildId);
	// I don't quite understand why I need to make copies here, but if I don't, the default config is overriden.
	const defaultConfigCopy = JSON.parse(JSON.stringify(defaultConfig));
	const overrideConfigCopy = JSON.parse(JSON.stringify(overrideConfig));
	return Object.assign({}, defaultConfigCopy, overrideConfigCopy, guildConfig);
}
