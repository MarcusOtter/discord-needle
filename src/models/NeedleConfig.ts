// TODO: Add license comments
// TODO: Remove "Needle" prefix for these types, kinda redundant
// TODO: Fix bug with success_thread_create

import MessageKey from "./enums/MessageKey";

export default interface NeedleConfig {
	threadChannels?: AutothreadChannelConfig[];
	emojisEnabled?: boolean;
	messages?: {
		[K in MessageKeys]: string;
	};
}

type MessageKeys = keyof typeof MessageKey;

export interface AutothreadChannelConfig {
	channelId: string;
	archiveImmediately?: boolean;
	messageContent?: string;
	includeBots?: boolean;
	slowmode?: number;
	titleFormat?: string;
}
