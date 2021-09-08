import * as defaultConfig from "../defaultConfig.json";
import * as overrideConfig from "../overrideConfig.json";

export function getConfig(): typeof defaultConfig & typeof overrideConfig {
	return Object.assign(defaultConfig, overrideConfig);
}
