import { Nullish } from "../helpers/typeHelpers";
import DeleteBehavior from "./enums/DeleteBehavior";
import ReplyMessageOption from "./enums/ReplyMessageOption";
import TitleType from "./enums/TitleType";
import ToggleOption from "./enums/ToggleOption";

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
	public readonly customTitle: string;
	public readonly closeButtonText: string;
	public readonly closeButtonStyle: string;
	public readonly titleButtonText: string;
	public readonly titleButtonStyle: string;

	// TODO IMPORTANT: Fix bug where switching away from custom title type will break stuff
	// Because I think I reset the custom title here like I do with message
	// I guess it should be the same as message and not be stored for no reason......
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

		this.titleType = titleType ?? oldConfig?.titleType ?? TitleType.FirstFourtyChars;
		this.customTitle = this.getCustomTitle(oldConfig, customTitle);
	}

	private getCustomReply(oldConfig: Nullish<AutothreadChannelConfig>, incomingCustomReply: Nullish<string>): string {
		const switchingAwayFromCustom =
			oldConfig?.replyType === ReplyMessageOption.Custom && this.replyType !== ReplyMessageOption.Custom;
		return switchingAwayFromCustom ? "" : incomingCustomReply ?? oldConfig?.customReply ?? "";
	}

	private getCustomTitle(oldConfig: Nullish<AutothreadChannelConfig>, incomingCustomTitle: Nullish<string>): string {
		if (this.titleType === TitleType.Custom) return incomingCustomTitle ?? oldConfig?.customTitle ?? "";
		if (oldConfig?.titleType === TitleType.Custom) return ""; // Reset if switching away from custom (TODO: I THINK THIS IS A BUG)
		return this.getDefaultTitle(this.titleType);
	}

	private getDefaultTitle(titleType: TitleType): string {
		switch (titleType) {
			case TitleType.FirstLineOfMessage:
				return "/.*/";
			case TitleType.FirstFourtyChars:
				return "/^((.|\\s){0,40})/ig";
			case TitleType.NicknameDate:
				return "$USER_NAME ($DATE_UTC)";
			case TitleType.Custom:
				return "";
			default:
				throw new Error("Unhandled default title: " + titleType);
		}
	}
}
