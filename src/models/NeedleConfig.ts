// TODO: Add license comments

import AutothreadChannelConfig from "./AutothreadChannelConfig.js";
import Setting from "./enums/Setting.js";

export default interface NeedleConfig {
	threadChannels: AutothreadChannelConfig[];
	settings: {
		[K in SettingKeys]: string;
	};
}

export const defaultConfig: NeedleConfig = {
	threadChannels: [],
	settings: {
		ErrorUnknown: "An unexpected error occurred. Please try again later.",
		ErrorOnlyInThread: "You can only perform this action inside a thread.",
		ErrorNoEffect: "This action will have no effect.",
		ErrorInsufficientUserPerms: "You do not have permission to perform this action.",
		ErrorInsufficientBotPerms: "The bot does not have permission to perform this action.",
		ErrorMaxThreadRenames: "You can only rename a thread twice every 10 minutes. Please try again later.",

		SuccessThreadCreated: "Thread automatically created by $USER_NAME in $CHANNEL_MENTION",
		SuccessThreadArchived: "Thread was archived by $USER_NAME. Anyone can send a message to unarchive it.",

		EmojiUnanswered: "🆕",
		EmojiArchived: "✅",
		EmojiLocked: "🔒",
	},
};

type SettingKeys = keyof typeof Setting;
