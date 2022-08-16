import { Nullish } from "../helpers/typeHelpers";
import ReplyType from "./enums/ReplyType";
import TitleType from "./enums/TitleFormat";
import ToggleOption from "./enums/ToggleOption";

export default class AutothreadChannelConfig {
	public readonly channelId: string;
	public readonly archiveImmediately: ToggleOption;
	public readonly replyType: ReplyType;
	public readonly customReply: string;
	public readonly includeBots: ToggleOption;
	public readonly slowmode: number;
	public readonly statusReactions: ToggleOption;
	public readonly titleType: TitleType;
	public readonly customTitle: string;

	constructor(
		oldConfig: Nullish<AutothreadChannelConfig>,
		channelId: string,
		archiveImmediately: Nullish<ToggleOption>,
		replyType: Nullish<ReplyType>,
		customReply: Nullish<string>,
		includeBots: Nullish<ToggleOption>,
		slowmode: Nullish<number>,
		statusReactions: Nullish<ToggleOption>,
		titleType: Nullish<TitleType>,
		customTitle: Nullish<string>
	) {
		this.channelId = channelId;
		this.archiveImmediately = archiveImmediately ?? oldConfig?.archiveImmediately ?? ToggleOption.On;
		this.replyType = replyType ?? oldConfig?.replyType ?? ReplyType.DefaultWithButtons;
		this.customReply = customReply ?? oldConfig?.customReply ?? "";
		this.includeBots = includeBots ?? oldConfig?.includeBots ?? ToggleOption.Off;
		this.slowmode = slowmode ?? oldConfig?.slowmode ?? 0;
		this.statusReactions = statusReactions ?? oldConfig?.statusReactions ?? ToggleOption.Off;

		this.titleType = titleType ?? oldConfig?.titleType ?? TitleType.FirstFourtyChars;
		this.customTitle =
			this.titleType === TitleType.Custom
				? customTitle ?? oldConfig?.customTitle ?? ""
				: this.getTitleRegex(this.titleType) ?? oldConfig?.customTitle ?? "";
	}

	private getTitleRegex(formatOption: Nullish<TitleType>): string | undefined {
		if (formatOption === undefined || formatOption === null) return undefined;
		switch (formatOption) {
			case TitleType.FirstLineOfMessage:
				return "/^(?:.*)$/m";
			case TitleType.FirstFourtyChars:
				return "/^((.|\\s){0,40})/ig";
			case TitleType.NicknameDate:
				return "$USER ($DATE)";

			default:
			case TitleType.DiscordDefault:
			case TitleType.Custom:
				return "";
		}
	}
}
