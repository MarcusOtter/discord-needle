import * as defaultConfig from "../config.json";
import * as overrideConfig from "../overrideConfig.json";

type DangerousConfig = Partial<typeof defaultConfig & typeof overrideConfig>;
type SafeConfig = Omit<DangerousConfig, "discordApiToken">

export function getConfig(): SafeConfig {
	const config = dangerouslyGetConfig();
	return sanetizeConfig(config);
}

export function getApiToken(): string | null {
	const config = dangerouslyGetConfig();
	return config.discordApiToken ?? null;
}

function sanetizeConfig(config: DangerousConfig): SafeConfig {
	delete config.discordApiToken;
	return config;
}

function dangerouslyGetConfig(): DangerousConfig {
	return Object.assign(defaultConfig, overrideConfig);
}
