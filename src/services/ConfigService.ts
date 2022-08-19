import * as path from "path";
import * as fs from "fs";
import NeedleConfig from "../models/NeedleConfig";
import DO_NOT_TOUCH_defaultConfig from "../config.json";
import Setting from "../models/enums/Setting";

export default class ConfigService {
	private readonly directoryPath: string;
	private readonly cache = new Map<string, NeedleConfig>();

	constructor(directoryPath: string) {
		this.directoryPath = path.resolve(__dirname, "../../", process.env.CONFIGS_PATH || directoryPath);
	}

	public get(guildId: string): NeedleConfig {
		const guildConfig = this.cache.get(guildId) ?? this.readFromFile(guildId);
		const defaultConfigCopy = this.getDefault();

		if (guildConfig) {
			guildConfig.settings = Object.assign({}, defaultConfigCopy.settings, guildConfig?.settings);
		}

		return Object.assign({}, defaultConfigCopy, guildConfig);
	}

	public set(guildId: string, config: NeedleConfig) {
		if (!fs.existsSync(this.directoryPath)) {
			fs.mkdirSync(this.directoryPath);
		}

		config.threadChannels = config.threadChannels?.filter(val => val !== null && val !== undefined);

		// Only save messages that are different from the defaults
		const defaultConfigCopy = this.getDefault();
		if (defaultConfigCopy.settings && config.settings) {
			for (const [key, message] of Object.entries(config.settings)) {
				if (message !== defaultConfigCopy.settings[key as keyof typeof Setting]) continue;
				delete config.settings[key as keyof typeof Setting];
			}
		}

		const configPath = this.getPath(guildId);
		fs.writeFileSync(configPath, JSON.stringify(config), { encoding: "utf-8" });
		this.cache.set(guildId, config);
	}

	public delete(guildId: string): boolean {
		const configPath = this.getPath(guildId);
		if (!fs.existsSync(configPath)) return false;

		fs.rmSync(configPath);
		this.cache.delete(guildId);

		console.log(`Deleted data for guild ${guildId}`);
		return true;
	}

	public getDefault(): NeedleConfig {
		// Return a clone so we don't mess with the actual default config (touch the variable here and only here)
		return JSON.parse(JSON.stringify(DO_NOT_TOUCH_defaultConfig));
	}

	private readFromFile(guildId: string): NeedleConfig | undefined {
		const configPath = this.getPath(guildId);
		if (!fs.existsSync(configPath)) return;

		const fileContent = fs.readFileSync(configPath, { encoding: "utf-8" });
		const config = JSON.parse(fileContent);
		this.cache.set(guildId, config);

		return config;
	}

	private getPath(guildId: string) {
		return path.join(this.directoryPath, `${guildId}.json`);
	}
}