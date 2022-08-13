// TODO: Add license comments
// TODO: Remove "Needle" prefix for these types, kinda redundant

import AutothreadChannelConfig from "./AutothreadChannelConfig";
import MessageKey from "./enums/MessageKey";

export default interface NeedleConfig {
	threadChannels: AutothreadChannelConfig[];
	emojisEnabled: boolean;
	messages: {
		[K in MessageKeys]: string;
	};
}

type MessageKeys = keyof typeof MessageKey;
