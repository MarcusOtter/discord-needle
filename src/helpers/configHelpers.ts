import * as defaultConfig from "../config.json";
import * as overrideConfig from "../overrideConfig.json";

type DangerousConfig = Partial<typeof defaultConfig & typeof overrideConfig>;
export type SafeConfig = Omit<DangerousConfig, "discordApiToken" | "dev">

const guildConfigs = new Map<string, SafeConfig>();

export function getConfig(guildId = ""): SafeConfig {
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

export function getApiToken(): DangerousConfig["discordApiToken"] {
	const config = dangerouslyGetConfig();
	return config.discordApiToken;
}

export function getDevConfig(): DangerousConfig["dev"] {
	return dangerouslyGetConfig().dev;
}

function sanitizeConfig(config: DangerousConfig): SafeConfig {
	delete config.discordApiToken;
	delete config.dev;
	return config;
}

function dangerouslyGetConfig(guildId = ""): DangerousConfig {
	const guildConfig = guildConfigs.get(guildId);

	// Objects to the right overwrite the properties of objects to the left
	return Object.assign(defaultConfig, guildConfig, overrideConfig);
}
