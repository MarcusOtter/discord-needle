import { Nullish } from "../helpers/typeHelpers";
import DeleteBehavior from "./enums/DeleteBehavior";
import ReplyType from "./enums/ReplyType";
import TitleType from "./enums/TitleType";
import ToggleOption from "./enums/ToggleOption";

export default class AutothreadChannelConfig {
	public readonly channelId: string;
	public readonly deleteBehavior: DeleteBehavior;
	public readonly archiveImmediately: ToggleOption;
	public readonly replyType: ReplyType;
	public readonly customReply: string;
	public readonly includeBots: ToggleOption;
	public readonly slowmode: number;
	public readonly statusReactions: ToggleOption;
	public readonly titleType: TitleType;
	public readonly customTitle: string;

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
		replyType: Nullish<ReplyType>,
		customReply: Nullish<string>,
		titleType: Nullish<TitleType>,
		customTitle: Nullish<string>
	) {
		this.channelId = channelId;
		this.deleteBehavior = deleteBehavior ?? oldConfig?.deleteBehavior ?? DeleteBehavior.DeleteIfEmptyElseArchive;
		this.archiveImmediately = archiveImmediately ?? oldConfig?.archiveImmediately ?? ToggleOption.On;
		this.includeBots = includeBots ?? oldConfig?.includeBots ?? ToggleOption.Off;
		this.slowmode = slowmode ?? oldConfig?.slowmode ?? 0;
		this.statusReactions = statusReactions ?? oldConfig?.statusReactions ?? ToggleOption.Off;

		this.replyType = replyType ?? oldConfig?.replyType ?? ReplyType.DefaultWithButtons;
		this.customReply = this.getCustomReply(oldConfig, customReply);

		this.titleType = titleType ?? oldConfig?.titleType ?? TitleType.FirstFourtyChars;
		this.customTitle = this.getCustomTitle(oldConfig, customTitle);
	}

	private getCustomReply(oldConfig: Nullish<AutothreadChannelConfig>, incomingCustomReply: Nullish<string>): string {
		const switchingAwayFromCustom = this.isCustom(oldConfig?.replyType) && !this.isCustom(this.replyType);
		return switchingAwayFromCustom ? "" : incomingCustomReply ?? oldConfig?.customReply ?? "";
	}

	private isCustom(replyType: Nullish<ReplyType>): boolean {
		if (!replyType) return false;
		return replyType === ReplyType.CustomWithButtons || replyType === ReplyType.CustomWithoutButtons;
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
