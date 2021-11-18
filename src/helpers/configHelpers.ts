import * as defaultConfig from "../config.json";
import * as overrideConfig from "../overrideConfig.json";
import { AutoArchiveDuration } from "../types/autoArchiveDuration";
import { NeedleConfig, SafeNeedleConfig } from "../types/needleConfig";

const guildConfigs = new Map<string, SafeNeedleConfig>();

export function getConfig(guildId = ""): SafeNeedleConfig {
	return sanitizeConfig(dangerouslyGetConfig(guildId));
}

export function setConfig(guildId: string, configObject: Record<string, unknown>): boolean {
	const validConfigObject = removeInvalidConfigKeys(configObject);
	guildConfigs.set(guildId, sanitizeConfig(validConfigObject));
	return true;
}

export function setAutoArchiveDuration(guildId: string, duration: string | number | null): boolean {
	if (!duration) { return false; }

	if (!isNaN(Number(duration))) {
		duration = Number(duration);
	}

	if (!Object.values(AutoArchiveDuration).includes(duration)) {
		return false;
	}

	const config = getConfig(guildId);
	config.threadArchiveDuration = duration as AutoArchiveDuration;
	return setConfig(guildId, config);
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
