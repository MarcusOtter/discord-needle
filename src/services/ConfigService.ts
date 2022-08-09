import * as path from "path";
import * as fs from "fs";
import NeedleConfig from "../models/NeedleConfig";
import * as defaultConfig from "../config.json";
import MessageKey from "../models/enums/MessageKey";

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
			guildConfig.messages = Object.assign({}, defaultConfigCopy.messages, guildConfig?.messages);
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
		if (defaultConfigCopy.messages && config.messages) {
			for (const [key, message] of Object.entries(config.messages)) {
				if (message !== defaultConfigCopy.messages[key as keyof typeof MessageKey]) continue;
				delete config.messages[key as keyof typeof MessageKey];
			}
		}

		const configPath = this.getPath(guildId);
		fs.writeFileSync(configPath, JSON.stringify(config), { encoding: "utf-8" });
		this.cache.set(guildId, config);
	}

	public delete(guildId: string): void {
		const configPath = this.getPath(guildId);
		if (!fs.existsSync(configPath)) return;

		fs.rmSync(configPath);
		this.cache.delete(guildId);

		console.log(`Deleted data for guild ${guildId}`);
	}

	public getDefault(): NeedleConfig {
		// Return a clone so we don't mess with the actual default config
		return JSON.parse(JSON.stringify(defaultConfig));
	}

	private readFromFile(guildId: string): NeedleConfig | undefined {
		const configPath = this.getPath(guildId);
		if (!fs.existsSync(configPath)) return;

		const fileContent = fs.readFileSync(configPath, { encoding: "utf-8" });
		return JSON.parse(fileContent);
	}

	private getPath(guildId: string) {
		return path.join(this.directoryPath, `${guildId}.json`);
	}
}
