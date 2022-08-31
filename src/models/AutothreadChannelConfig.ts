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

import type { Nullish } from "../helpers/typeHelpers.js";
import DeleteBehavior from "./enums/DeleteBehavior.js";
import ReplyMessageOption from "./enums/ReplyMessageOption.js";
import TitleType from "./enums/TitleType.js";
import ToggleOption from "./enums/ToggleOption.js";

export default class AutothreadChannelConfig {
	public readonly channelId: string;
	public readonly deleteBehavior: DeleteBehavior;
	public readonly archiveImmediately: ToggleOption;
	public readonly replyType: ReplyMessageOption;
	public readonly customReply: string;
	public readonly includeBots: ToggleOption;
	public readonly slowmode: number;
	public readonly statusReactions: ToggleOption;
	public readonly titleType: TitleType;
	public readonly titleMaxLength: number;
	public readonly regexJoinText: string;
	public readonly customTitle: string;
	public readonly closeButtonText: string;
	public readonly closeButtonStyle: string;
	public readonly titleButtonText: string;
	public readonly titleButtonStyle: string;

	constructor(
		oldConfig: Nullish<AutothreadChannelConfig>,
		channelId: string,
		deleteBehavior: Nullish<DeleteBehavior>,
		archiveImmediately: Nullish<ToggleOption>,
		includeBots: Nullish<ToggleOption>,
		slowmode: Nullish<number>,
		statusReactions: Nullish<ToggleOption>,
		replyType: Nullish<ReplyMessageOption>,
		customReply: Nullish<string>,
		titleType: Nullish<TitleType>,
		titleMaxLength: Nullish<number>,
		regexJoinText: Nullish<string>,
		customTitle: Nullish<string>,
		closeButtonText: Nullish<string>,
		closeButtonStyle: Nullish<string>,
		titleButtonText: Nullish<string>,
		titleButtonStyle: Nullish<string>
	) {
		this.channelId = channelId;
		this.deleteBehavior = deleteBehavior ?? oldConfig?.deleteBehavior ?? DeleteBehavior.DeleteIfEmptyElseArchive;
		this.archiveImmediately = archiveImmediately ?? oldConfig?.archiveImmediately ?? ToggleOption.On;
		this.includeBots = includeBots ?? oldConfig?.includeBots ?? ToggleOption.Off;
		this.slowmode = slowmode ?? oldConfig?.slowmode ?? 0;
		this.statusReactions = statusReactions ?? oldConfig?.statusReactions ?? ToggleOption.Off;

		this.closeButtonText = closeButtonText ?? oldConfig?.closeButtonText ?? "Archive thread";
		this.closeButtonStyle = closeButtonStyle?.toLowerCase() ?? oldConfig?.closeButtonStyle ?? "green";
		this.titleButtonText = titleButtonText ?? oldConfig?.titleButtonText ?? "Edit title";
		this.titleButtonStyle = titleButtonStyle?.toLowerCase() ?? oldConfig?.titleButtonStyle ?? "blurple";

		this.replyType = replyType ?? oldConfig?.replyType ?? ReplyMessageOption.Default;
		this.customReply = this.getCustomReply(oldConfig, customReply);

		this.titleType = titleType ?? oldConfig?.titleType ?? TitleType.FirstFiftyChars;
		this.titleMaxLength = titleMaxLength ?? oldConfig?.titleMaxLength ?? 50;
		this.regexJoinText = regexJoinText ?? oldConfig?.regexJoinText ?? "";
		this.customTitle = this.getCustomTitle(oldConfig, customTitle);
	}

	private getCustomReply(oldConfig: Nullish<AutothreadChannelConfig>, incomingCustomReply: Nullish<string>): string {
		const switchingAwayFromCustom =
			oldConfig?.replyType === ReplyMessageOption.Custom && this.replyType !== ReplyMessageOption.Custom;
		return switchingAwayFromCustom ? "" : incomingCustomReply ?? oldConfig?.customReply ?? "";
	}

	private getCustomTitle(oldConfig: Nullish<AutothreadChannelConfig>, incomingCustomTitle: Nullish<string>): string {
		if (this.titleType === TitleType.Custom) return incomingCustomTitle ?? oldConfig?.customTitle ?? "";
		return this.getDefaultTitle(this.titleType);
	}

	private getDefaultTitle(titleType: TitleType): string {
		switch (titleType) {
			case TitleType.FirstLineOfMessage:
				return "/.*/";
			case TitleType.FirstFiftyChars:
				return "/^[\\S\\s]*/g";
			case TitleType.NicknameDate:
				return "$USER_NICKNAME ($DATE_UTC)";
			case TitleType.Custom:
				return "";
			default:
				throw new Error("Unhandled default title: " + titleType);
		}
	}
}
