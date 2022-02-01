import type { Guild } from "discord.js";
import * as defaultConfig from "../config.json";
import { resolve as pathResolve } from "path";
import * as fs from "fs";
import type { NeedleConfig } from "../types/needleConfig";
import { MessageKey } from "./messageHelpers";

const CONFIGS_PATH = pathResolve(__dirname, "../../configs");
const guildConfigsCache = new Map<string, NeedleConfig>();

export function getConfig(guildId = ""): NeedleConfig {
	const guildConfig = guildConfigsCache.get(guildId) ?? readConfigFromFile(guildId);

	const defaultConfigCopy = JSON.parse(JSON.stringify(defaultConfig)) as NeedleConfig;
	if (guildConfig) {
		guildConfig.messages = Object.assign({}, defaultConfigCopy.messages, guildConfig?.messages);
	}

	return Object.assign({}, defaultConfigCopy, guildConfig);
}

// Used by deploy-commands.js (!)
export function getApiToken(): string | undefined {
	return process.env.DISCORD_API_TOKEN;
}

// Used by deploy-commands.js (!)
export function getClientId(): string | undefined {
	return process.env.CLIENT_ID;
}

// Used by deploy-commands.js (!)
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

export function resetConfigToDefault(guildId: string): boolean {
	const path = getGuildConfigPath(guildId);
	if (!fs.existsSync(path)) return false;
	fs.rmSync(path);
	guildConfigsCache.delete(guildId);
	console.log(`Deleted data for guild ${guildId}`);
	return true;
}

export function deleteConfigsFromUnkownServers(client: Client): void {
	if (!client.guilds.cache.size) {
		console.warn("No guilds available; skipping config deletion.");
		return;
	}

	const configFiles = fs.readdirSync(CONFIGS_PATH);
	configFiles.forEach(file => {
		const guildId = file.split(".")[0];
		if (!client.guilds.cache.has(guildId)) {
			resetConfigToDefault(guildId);
		}
	});
}

function readConfigFromFile(guildId: string): NeedleConfig | undefined {
	const path = getGuildConfigPath(guildId);
	if (!fs.existsSync(path)) return undefined;

	const jsonConfig = fs.readFileSync(path, { "encoding": "utf-8" });
	return JSON.parse(jsonConfig);
}

function getGuildConfigPath(guildId: string) {
	return `${CONFIGS_PATH}/${guildId}.json`;
}

function setConfig(guild: Guild | null | undefined, config: NeedleConfig): boolean {
	if (!guild || !config) return false;

	const path = getGuildConfigPath(guild.id);
	if (!fs.existsSync(CONFIGS_PATH)) {
		fs.mkdirSync(CONFIGS_PATH);
	}
	config.threadChannels = config.threadChannels?.filter(val => val != null && val != undefined);

	// Only save messages that are different from the defaults
	const defaultConfigCopy = JSON.parse(JSON.stringify(defaultConfig)) as NeedleConfig;
	if (defaultConfigCopy.messages && config.messages) {
		for(const [key, message] of Object.entries(config.messages)) {
			if (message !== defaultConfigCopy.messages[key as MessageKey]) continue;
			delete config.messages[key as MessageKey];
		}
	}

	fs.writeFileSync(path, JSON.stringify(config), { encoding: "utf-8" });
	guildConfigsCache.set(guild.id, config);
	return true;
}
