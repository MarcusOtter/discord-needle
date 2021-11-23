import { TextBasedChannels } from "discord.js";
import * as defaultConfig from "../config.json";
import * as overrideConfig from "../overrideConfig.json";
import { NeedleConfig, SafeNeedleConfig } from "../types/needleConfig";
import { MessageKey } from "./messageHelpers";

const guildConfigs = new Map<string, SafeNeedleConfig>();

export function getConfig(guildId = ""): SafeNeedleConfig {
	return sanitizeConfig(dangerouslyGetConfig(guildId));
}

export function setConfig(guildId: string, configObject: Record<string, unknown>): boolean {
	const validConfigObject = removeInvalidConfigKeys(configObject);
	guildConfigs.set(guildId, sanitizeConfig(validConfigObject));
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

export function setMessage(guildId: string, messageKey: MessageKey, value: string): boolean {
	const config = getConfig(guildId);
	if (!config || !config.messages) { return false; }
	if (value.length > 2000) { return false; }

	config.messages[messageKey] = value;
	return setConfig(guildId, config);
}

export function enableAutothreading(guildId: string, channelId: string, message = ""): boolean {
	const config = getConfig(guildId);
	if (!config || !config.threadChannels) { return false; }
	if (message.length > 2000) { return false; }

	const index = config.threadChannels.findIndex(x => x?.channelId === channelId);
	if (index > -1) {
		config.threadChannels[index].messageContent = message;
	}
	else {
		config.threadChannels.push({ channelId: channelId, messageContent: message });
	}

	return setConfig(guildId, config);
}

export function disableAutothreading(guildId: string, channelId: string): boolean {
	const config = getConfig(guildId);
	if (!config || !config.threadChannels) { return false; }

	const index = config.threadChannels.findIndex(x => x?.channelId === channelId);
	if (index > -1) {
		delete config.threadChannels[index];
	}

	return setConfig(guildId, config);
}

function sanitizeConfig(config: NeedleConfig): SafeNeedleConfig {
	delete config.discordApiToken;
	delete config.dev;
	return config;
}

function dangerouslyGetConfig(guildId = ""): NeedleConfig {
	const guildConfig = guildConfigs.get(guildId);

	// Objects to the right overwrite the properties of objects to the left
	return Object.assign(defaultConfig, guildConfig, overrideConfig);
}
