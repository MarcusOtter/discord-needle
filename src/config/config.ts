import * as config from "../config.json";

export function getConfig(): Config {
	return config as Config;
}

interface Config {
	discordApiToken: string;
	threadArchiveDurationInMinutes: 60 | 1440 | 4320 | 10080 | "MAX";
	threadMessage: {
		shouldSend: boolean,
		shouldPin: boolean,
		content: string,
		embeds: string[]
	},
	threadChannels: string[];
}
