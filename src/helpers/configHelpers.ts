/*
This file is part of Needle.

Needle is free software: you can redistribute it and/or modify it under the terms of the GNU
Affero General Public License as published by the Free Software Foundation, either version 3 of
the License, or (at your option) any later version.

Needle is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even
the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero
General Public License for more details.

You should have received a copy of the GNU Affero General Public License along with Needle.
If not, see <https://www.gnu.org/licenses/>.
*/

import type { Client, Guild, ThreadChannel } from "discord.js";
import * as defaultConfig from "../config.json";
import { resolve as pathResolve } from "path";
import * as fs from "fs";
import type { NeedleConfig } from "../types/needleConfig";
import { MessageKey } from "./messageHelpers";

const CONFIGS_PATH = pathResolve(__dirname, "../../", process.env.CONFIGS_PATH || "configs");
const guildConfigsCache = new Map<string, NeedleConfig>();

export function getConfig(guildId = ""): NeedleConfig {
	const guildConfig = guildConfigsCache.get(guildId) ?? readConfigFromFile(guildId);

	const defaultConfigCopy = JSON.parse(JSON.stringify(defaultConfig)) as NeedleConfig;
	if (guildConfig) {
		guildConfig.messages = Object.assign({}, defaultConfigCopy.messages, guildConfig?.messages);
	}

	return Object.assign({}, defaultConfigCopy, guildConfig);
}

// Can probably remove the three methods below :)

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

export function shouldArchiveImmediately(thread: ThreadChannel) {
	const config = getConfig(thread.guildId);
	return config?.threadChannels?.find(x => x.channelId === thread.parentId)?.archiveImmediately ?? true;
}

export function includeBotsForAutothread(guildId: string, channelId: string) {
	const config = getConfig(guildId);
	return config?.threadChannels?.find(x => x.channelId === channelId)?.includeBots ?? false;
}

export function setEmojisEnabled(guild: Guild, enabled: boolean): boolean {
	const config = getConfig(guild.id);
	config.emojisEnabled = enabled;
	return setConfig(guild, config);
}

export function emojisEnabled(guild: Guild): boolean {
	const config = getConfig(guild.id);
	return config.emojisEnabled ?? true;
}

export function setMessage(guild: Guild, messageKey: MessageKey, value: string): boolean {
	const config = getConfig(guild.id);
	if (!config || !config.messages) return false;

	if (value.length > 2000) return false;

	config.messages[messageKey] = value;
	return setConfig(guild, config);
}

export function getSlowmodeSeconds(guildId: string, channelId: string) {
	const config = getConfig(guildId);
	return config?.threadChannels?.find(x => x.channelId === channelId)?.slowmode ?? 0;
}

export function enableAutothreading(
	guild: Guild,
	channelId: string,
	includeBots?: boolean,
	archiveImmediately?: boolean,
	messageContent?: string,
	slowmode?: number
): boolean {
	const config = getConfig(guild.id);
	if (!config || !config.threadChannels) return false;

	if ((messageContent?.length ?? 0) > 2000) return false;

	const index = config.threadChannels.findIndex(x => x?.channelId === channelId);
	if (index > -1) {
		if (includeBots !== undefined) config.threadChannels[index].includeBots = includeBots;
		if (archiveImmediately !== undefined) config.threadChannels[index].archiveImmediately = archiveImmediately;

		if (messageContent !== undefined) config.threadChannels[index].messageContent = messageContent;
		if (slowmode !== undefined) config.threadChannels[index].slowmode = slowmode;
	} else {
		config.threadChannels.push({
			channelId,
			includeBots,
			archiveImmediately,
			messageContent,
			slowmode,
		});
	}

	return setConfig(guild, config);
}

export function disableAutothreading(guild: Guild, channelId: string): boolean {
	const config = getConfig(guild.id);
	if (!config || !config.threadChannels) return false;

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

export function deleteConfigsFromUnknownServers(client: Client): void {
	if (!client.guilds.cache.size) {
		console.warn("No guilds available; skipping config deletion.");
		return;
	}

	if (!fs.existsSync(CONFIGS_PATH)) return;

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

	const jsonConfig = fs.readFileSync(path, { encoding: "utf-8" });
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

	config.threadChannels = config.threadChannels?.filter(val => val !== null && val !== undefined);

	// Only save messages that are different from the defaults
	const defaultConfigCopy = JSON.parse(JSON.stringify(defaultConfig)) as NeedleConfig;
	if (defaultConfigCopy.messages && config.messages) {
		for (const [key, message] of Object.entries(config.messages)) {
			if (message !== defaultConfigCopy.messages[key as MessageKey]) continue;
			delete config.messages[key as MessageKey];
		}
	}

	fs.writeFileSync(path, JSON.stringify(config), { encoding: "utf-8" });
	guildConfigsCache.set(guild.id, config);
	return true;
}
