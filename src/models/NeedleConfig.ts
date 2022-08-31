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

import type AutothreadChannelConfig from "./AutothreadChannelConfig.js";
import type Setting from "./enums/Setting.js";

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

		SuccessThreadCreated: "Thread automatically created by $USER_NICKNAME in $CHANNEL_MENTION",
		SuccessThreadArchived: "Thread was archived by $USER_NICKNAME. Anyone can send a message to unarchive it.",

		EmojiUnanswered: "🆕",
		EmojiArchived: "✅",
		EmojiLocked: "🔒",
	},
};

type SettingKeys = keyof typeof Setting;
