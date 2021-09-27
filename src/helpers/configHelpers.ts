import * as defaultConfig from "../config.json";
import * as overrideConfig from "../overrideConfig.json";

type DangerousConfig = Partial<typeof defaultConfig & typeof overrideConfig>;
type SafeConfig = Omit<DangerousConfig, "discordApiToken" | "dev">

const guildConfigs = new Map<string, SafeConfig>();

export function getConfig(guildId = ""): SafeConfig {
	return sanitizeConfig(dangerouslyGetConfig(guildId));
}

export function setConfig(guildId: string, configObject: Record<string, unknown>): boolean {
	const validConfigObject = removeInvalidConfigKeys(configObject);
	guildConfigs.set(guildId, sanitizeConfig(validConfigObject));
	return true;
}

/**
 * Removes the keys of an object that are not valid keys of a configuration object.
 * `discordApiToken` and similar keys *are* allowed, so results will need to be sanitized further to get a SafeConfig.
 */
export function removeInvalidConfigKeys(configObject: Record<string, unknown>): Record<string, unknown> {
	const validConfigKeys = Object.keys(sanitizeConfig(dangerouslyGetConfig()));
	const configObjectCopy = JSON.parse(JSON.stringify(configObject));

	Object.keys(configObjectCopy).forEach(key => {
		if (validConfigKeys.includes(key)) return;
		delete configObjectCopy[key];
	});

	return configObjectCopy;
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
	// Meaning that overrideConfig overrides the guild, that in turn overrides the deafult.
	return Object.assign(defaultConfig, guildConfig, overrideConfig);
}
